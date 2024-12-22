const TextInput = ({ handleChange, data }) => {
  return (
    <input
      className="text-form"
      required
      value={data.text}
      onChange={(e) => handleChange(e, data.id)}
    />
  );
};

export default TextInput;
