"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LuDownload } from "react-icons/lu";

const Home = () => {
  const [images, setImages] = useState([]); // Stores the available images
  const [formData, setFormData] = useState({ text0: "", text1: "" }); // Store the form data
  const [currentImage, setCurrentImage] = useState(""); // Store the current preview image url
  const [currentImageID, setCurrentImageID] = useState(""); // Store the current preview image ID
  const [generatedMeme, setGeneratedMeme] = useState(""); // Store the generated meme URL
  const [generating, setGenerating] = useState(false); // Store the generating state

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("https://api.imgflip.com/get_memes");
        const data = await res.json();
        if (data?.success) {
          setImages(data.data.memes);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchImages();
  }, []);

  const handleImageChange = (e) => {
    setCurrentImage(e.target.src);
    setCurrentImageID(e.target.alt);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleGenerate = async () => {
    if (!currentImageID) {
      alert("Please select an image.");
      return;
    }
    if (!formData.text0 || !formData.text1) {
      alert("Please fill in both text fields.");
      return;
    }

    try {
      setGenerating(true);
      const res = await fetch("https://api.imgflip.com/caption_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          template_id: currentImageID,
          username: process.env.NEXT_PUBLIC_IMGFLIP_USERNAME,
          password: process.env.NEXT_PUBLIC_IMGFLIP_PASSWORD,
          text0: formData.text0,
          text1: formData.text1,
        }),
      });

      const data = await res.json();
      if (data?.success) {
        setGeneratedMeme(data.data.url);
        console.log(data.data.url);
        setCurrentImage(data.data.url);
      } else {
        console.error(data.error_message);
        alert("Error generating meme: " + data.error_message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate the meme. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = generatedMeme;
    link.download = "generated_meme.jpg"; // TODO name based on the generated meme
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <nav>
        <ul className="flex p-5 items-center">
          <Image
            src="/OOH_face.jpg"
            height={100}
            width={100}
            className="w-20 rounded-md"
            alt="Logo"
          />
          <li className="font-extrabold text-white bg-orange-500  text-4xl p-2 rounded-md ml-2">Meme Generator</li>
        </ul>
      </nav>

      <div className="flex mx-4 gap-4">
        <div className="editor">
          {currentImage ? (
            <img
              src={currentImage}
              width={200}
              height={200}
              className="w-full rounded-md"
              alt="Selected Image"
            />
          ) : (
            <h3 className="text-center font-bold">[Select an Image]</h3>
          )}
          <form>
            <label>Text 0:</label>
            <input
              className="text-form"
              name="text0"
              onChange={handleChange}
              required={true}
              value={formData.text0}
            />
            <br />
            <label>Text 1:</label>
            <input
              className="text-form"
              name="text1"
              onChange={handleChange}
              required={true}
              value={formData.text1}
            />
          </form>
          <div className="flex gap-4 self-center h-10">
            <button className="generate-btn" onClick={handleGenerate}>
              {generating ? "Generating..." : "Generate"}
            </button>
            <button className="download-btn" onClick={handleDownload}>
              <LuDownload />
            </button>
          </div>
        </div>
        <div className="w-[62rem] max-w-[70%] flex p-2 gap-2 flex-wrap">
          {images.length > 0 ? (
            images.map((data, key) => (
              <div key={key} className="image">
                <img
                  src={data.url}
                  className="w-48 h-48"
                  onClick={handleImageChange}
                  alt={data.id}
                />
              </div>
            ))
          ) : (
            <h2>Fetching Images</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
