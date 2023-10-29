import React, { useState } from "react";
import UseForm from "./useForm";

function CopyToClipboardButton() {
  const { formData } = UseForm();
  const [textToCopy, setTextToCopy] = useState("Text to copy");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = () => {
    if (formData.response != null) {
      formData.response.select();
    }
    document.execCommand("copy");

    setIsCopied(true);

    // Reset the "Copied" message after a short delay
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  return (
    <div>
      <p>
        {isCopied
          ? "Text copied to clipboard!"
          : "Click the button to copy the text."}
      </p>
      <button onClick={handleCopyToClipboard}>Copy to Clipboard</button>
    </div>
  );
}

export default CopyToClipboardButton;
