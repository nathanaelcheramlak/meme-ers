"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LuDownload } from "react-icons/lu";

const Home = () => {
  const [texts, setTexts] = useState([{ id: 1, text: "" }]);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [generatedMeme, setGeneratedMeme] = useState("");
  const [generating, setGenerating] = useState(false);

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
        alert("Something went wrong. Please refresh the page.");
      }
    };

    fetchImages();
  }, []);

  const handleImageChange = (data) => {
    setSelectedImage(data);
    const textCount = data.box_count;
    const newTexts = Array.from({ length: textCount }, (_, i) => ({
      id: i + 1,
      text: "",
    }));
    setTexts(newTexts);
    setGeneratedMeme(""); // Clear previous meme preview
  };

  const handleChange = (e, id) => {
    const value = e.target.value;
    setTexts((prev) =>
      prev.map((text) => (text.id === id ? { ...text, text: value } : text))
    );
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      alert("Please select an image to generate a meme.");
      return;
    }

    try {
      setGenerating(true);

      const params = new URLSearchParams({
        template_id: selectedImage.id,
        username: process.env.NEXT_PUBLIC_IMGFLIP_USERNAME,
        password: process.env.NEXT_PUBLIC_IMGFLIP_PASSWORD,
      });

      texts.forEach((text, index) => {
        params.append(`boxes[${index}][text]`, text.text);
      });

      const res = await fetch("https://api.imgflip.com/caption_image", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      const data = await res.json();
      if (data?.success) {
        setGeneratedMeme(data.data.url); // Update preview with the new meme URL
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
    link.download = "generated_meme.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <nav>
        <ul className="flex p-5 items-center">
          <Image
            src="/OOH_face.jpg"
            height={100}
            width={100}
            className="lg:w-20 w-16 rounded-md"
            alt="Logo"
          />
          <li className="font-extrabold text-white bg-orange-500 lg:text-4xl text-2xl p-2 rounded-md ml-2">
            Meme Generator
          </li>
        </ul>
      </nav>

      <div className="lg:flex mx-4 gap-4">
        <div className="editor">
          {generatedMeme ? (
            <img
              src={generatedMeme}
              className="w-full rounded-md"
              id="meme-preview"
              alt="Generated Meme Preview"
            />
          ) : selectedImage ? (
            <img
              src={selectedImage.url}
              className="w-full rounded-md"
              alt="Selected Meme Template"
            />
          ) : (
            <h3 className="text-center font-bold">*[Select an Image]</h3>
          )}

          {selectedImage && <h2 className="text-center font-bold mt-2">Add Captions</h2>}

          <form>
            {texts.map((text) => (
              <div key={text.id}>
                <label>Text {text.id}: </label>
                <input
                  type="text"
                  placeholder={`Text ${text.id}`}
                  value={text.text}
                  onChange={(e) => handleChange(e, text.id)}
                  className="text-form"
                />
              </div>
            ))}
          </form>

          <div className="flex gap-4 self-center h-10">
            <button className="generate-btn" onClick={handleGenerate}>
              {generating ? "Generating..." : "Generate"}
            </button>
            <button
              className="download-btn"
              onClick={handleDownload}
              disabled={!generatedMeme}
            >
              <LuDownload />
            </button>
          </div>
        </div>

        <div className="lg:w-[62rem] lg:max-w-[70%] flex p-2 gap-2 flex-wrap justify-center">
          {images.length > 0 ? (
            images.map((data) => (
              <div key={data.id} className="image">
                <img
                  src={data.url}
                  className="lg:w-48 lg:h-48 w-28 h-28"
                  onClick={() => handleImageChange(data)}
                  alt={data.name}
                />
              </div>
            ))
          ) : (
            <h2>Fetching Images...</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
