import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Upload, X, CheckCircle2, Image as ImageIcon, Video as VideoIcon, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { dbBooking, submitReview } from "../../services/dbService";
import { uploadMediaToCloudinary } from "../../services/cloudinaryService";
import { compressImage } from "../../utils/imageCompressor";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Partial<dbBooking>;
  onReviewSubmitted?: () => void;
}

interface MediaItem {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

const ratingLabels: Record<number, string> = {
  1: "Poor 😡 - Needs Improvement",
  2: "Fair 😐 - Standard Service",
  3: "Good 🙂 - Satisfied",
  4: "Very Good! 😄 - Really Clean",
  5: "Excellent! 🤩 - Outstanding Detailing"
};

export default function ReviewModal({ isOpen, onClose, booking, onReviewSubmitted }: ReviewModalProps) {
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const activeStarRating = hoverStars || stars;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files);
    setIsCompressing(true);
    setErrorMsg("");

    const newMediaItems: MediaItem[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        setErrorMsg("Please upload only valid Image or Video files.");
        continue;
      }

      if (isVideo) {
        // Video preview
        newMediaItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl: URL.createObjectURL(file),
          type: "video",
          originalSize: file.size,
          compressedSize: file.size,
          reductionPercentage: 0
        });
      } else if (isImage) {
        // Run Canvas Image Size Reducer before adding
        try {
          const compResult = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.75
          });

          newMediaItems.push({
            id: Math.random().toString(36).substring(2, 9),
            file: compResult.compressedFile,
            previewUrl: compResult.dataUrl,
            type: "image",
            originalSize: compResult.originalSize,
            compressedSize: compResult.compressedSize,
            reductionPercentage: compResult.reductionPercentage
          });
        } catch (err) {
          console.error("Compression error, fallback to raw photo:", err);
          newMediaItems.push({
            id: Math.random().toString(36).substring(2, 9),
            file,
            previewUrl: URL.createObjectURL(file),
            type: "image",
            originalSize: file.size,
            compressedSize: file.size,
            reductionPercentage: 0
          });
        }
      }
    }

    setMediaItems((prev) => [...prev, ...newMediaItems]);
    setIsCompressing(false);
    e.target.value = "";
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setErrorMsg("Please write a brief review detailing your experience.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const imageUrls: string[] = [];
      const videoUrls: string[] = [];

      // Upload each compressed photo/video to Cloudinary pipeline
      for (const item of mediaItems) {
        const uploadRes = await uploadMediaToCloudinary(item.file);
        if (uploadRes.resourceType === "video") {
          videoUrls.push(uploadRes.url);
        } else {
          imageUrls.push(uploadRes.url);
        }
      }

      await submitReview({
        customerId: booking.customerId || "customer",
        customerName: booking.customerName || "Valued Customer",
        bookingId: booking.id || "booking",
        stars,
        review: reviewText,
        images: imageUrls,
        videos: videoUrls,
        serviceName: booking.serviceName || "Car Cleaning Service",
        serviceDate: booking.scheduledDate || new Date().toISOString().split("T")[0]
      });

      setSubmitSuccess(true);
      if (onReviewSubmitted) onReviewSubmitted();

      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setErrorMsg("Failed to submit review: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 relative text-left space-y-6"
      >
        {/* Header bar */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full">
              -Style Verified Review
            </span>
            <h3 className="font-heading font-extrabold text-dark text-xl mt-1">
              Rate Your Car Cleaning Experience
            </h3>
            <p className="text-gray-400 text-xs truncate">
              Service: <span className="font-bold text-dark">{booking.serviceName}</span> ({booking.scheduledDate})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-dark p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {submitSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10 space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-2xl font-heading font-extrabold text-dark">Thank You For Your Review!</h4>
              <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto">
                Your star rating, feedback, and Cloudinary media have been published successfully.
              </p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1.    Interactive Star Ratings */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Overall Service Rating
              </label>
              <div className="flex justify-center items-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setStars(starVal)}
                    onMouseEnter={() => setHoverStars(starVal)}
                    onMouseLeave={() => setHoverStars(0)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={
                        starVal <= activeStarRating
                          ? "fill-[#F4B400] text-[#F4B400] drop-shadow-sm"
                          : "text-gray-300 hover:text-amber-300 transition-colors"
                      }
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs font-black text-[#0B1220] h-5 transition-all">
                {ratingLabels[activeStarRating]}
              </div>
            </div>

            {/* 2. Written Review Feedback */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Detailed Review & Feedback
              </label>
              <textarea
                required
                rows={4}
                placeholder="Share what you liked about the foam wash, interior detailing, or crew behavior..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
              />
            </div>

            {/* 3. Media Upload (Photos & Video) + Image Size Reducer notice */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-primary" />
                  Add Photos & Video (Cloudinary Upload)
                </label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded-full flex items-center gap-1">
                  <Sparkles size={11} /> Size Reducer Enabled
                </span>
              </div>

              <div className="relative border-2 border-dashed border-gray-200 hover:border-primary/50 bg-gray-50/50 rounded-2xl p-4 text-center transition-all">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <p className="text-xs font-bold text-dark">Click or Drag to upload Photos & Videos</p>
                  <p className="text-[10px] text-gray-400">Automatic HTML5 Canvas Compression reduces storage size before upload</p>
                </div>
              </div>

              {isCompressing && (
                <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Compressing photos to save storage & speed up upload...</span>
                </div>
              )}

              {/* Media Thumbnails preview */}
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {mediaItems.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-black">
                      {item.type === "video" ? (
                        <video src={item.previewUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.previewUrl} alt="Review upload" className="w-full h-full object-cover" />
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(item.id)}
                        className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity cursor-pointer z-20"
                        title="Remove file"
                      >
                        <X size={12} />
                      </button>

                      {item.type === "video" ? (
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <VideoIcon size={10} /> Video
                        </span>
                      ) : (
                        item.reductionPercentage > 0 && (
                          <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                            -{item.reductionPercentage}% KB
                          </span>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <Star size={16} className="fill-white" />
                  <span>Submit    Review</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
