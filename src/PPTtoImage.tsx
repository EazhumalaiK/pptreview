import React, { useState } from "react";
import UploadComponent from "./UploadComponent";
import FirstColumn from "./FirstColumn";
import SecondColumn from "./SecondColumn";
import ThirdColumn from "./ThirdColumn";
import type { Comment } from "./ThirdColumn";

const backendUrl = "http://127.0.0.1:8000";

const PPTtoImage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [correctedSlideImages, setCorrectedSlideImages] = useState<string[]>(
    []
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [comments, setComments] = useState<Comment[][]>([]);
  const [newComment, setNewComment] = useState<string>("");

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    const commentObj: Comment = {
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedSlideComments = [
      ...(comments[currentSlideIndex] || []),
      commentObj,
    ];
    const allComments = [...comments];
    allComments[currentSlideIndex] = updatedSlideComments;
    setComments(allComments);
    setNewComment("");

    try {
      const response = await fetch(`${backendUrl}/amend-slide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slideIndex: currentSlideIndex,
          comment: commentObj.text,
          report: selectedReport,
        }),
      });

      const result = await response.json();

      const updatedCorrectedSlides = [...correctedSlideImages];
      updatedCorrectedSlides[currentSlideIndex] =
        result.correctedImageUrl.startsWith("http")
          ? result.correctedImageUrl
          : backendUrl + result.correctedImageUrl;

      setCorrectedSlideImages(updatedCorrectedSlides);
    } catch (err) {
      console.error("Comment update failed:", err);
    }
  };

  return (
    <div className="p-6 bg-white w-full h-screen flex flex-col space-y-6">
      <UploadComponent
        selectedReport={selectedReport}
        setSelectedReport={setSelectedReport}
        uploadedFile={uploadedFile}
        setUploadedFile={setUploadedFile}
        fileInfo={fileInfo}
        setFileInfo={setFileInfo}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        setSlideImages={setSlideImages}
        setCorrectedSlideImages={setCorrectedSlideImages}
        setComments={setComments}
        setCurrentSlideIndex={setCurrentSlideIndex}
        error={error}
        setError={setError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      {/* Slide navigation boxes */}
      <div className="mt-4 flex justify-center space-x-2">
        {slideImages.length > 0 && // Only show the navigation buttons if there are slides
          slideImages.map((_, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 ${
                currentSlideIndex === index ? "bg-blue-700" : ""
              }`}
              onClick={() => setCurrentSlideIndex(index)}
            >
              {index + 1}
            </button>
          ))}
      </div>

      {/* Display the current slide */}
      {slideImages.length > 0 && (
        <div className="flex flex-1 space-x-4 overflow-hidden mt-6">
          <FirstColumn
            slideImage={slideImages[currentSlideIndex]}
            currentSlideIndex={currentSlideIndex}
          />
          <SecondColumn
            correctedImage={correctedSlideImages[currentSlideIndex]}
            currentSlideIndex={currentSlideIndex}
          />
          <ThirdColumn
            comments={comments[currentSlideIndex] || []}
            newComment={newComment}
            setNewComment={setNewComment}
            onCommentSubmit={handleCommentSubmit}
          />
        </div>
      )}
    </div>
  );
};

export default PPTtoImage;
