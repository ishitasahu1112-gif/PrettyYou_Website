import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as Facemesh from '@mediapipe/face_mesh';
import * as camera_utils from '@mediapipe/camera_utils';

const VirtualTryOn = ({ product, onClose }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    const EAR_INDEX_LEFT = 234; // Approximate index for left ear
    const EAR_INDEX_RIGHT = 454; // Approximate index for right ear

    useEffect(() => {
        const faceMesh = new Facemesh.FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        faceMesh.onResults(onResults);

        if (webcamRef.current && webcamRef.current.video) {
            const camera = new camera_utils.Camera(webcamRef.current.video, {
                onFrame: async () => {
                    if (webcamRef.current && webcamRef.current.video) {
                        await faceMesh.send({ image: webcamRef.current.video });
                    }
                },
                width: 640,
                height: 480
            });
            camera.start();
        }

        return () => {
            // Cleanup if needed
        };
    }, []);

    const onResults = (results) => {
        setIsLoading(false);
        if (!canvasRef.current || !webcamRef.current || !webcamRef.current.video) return;

        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const ctx = canvasRef.current.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        ctx.drawImage(results.image, 0, 0, videoWidth, videoHeight);

        if (results.multiFaceLandmarks) {
            for (const landmarks of results.multiFaceLandmarks) {
                // Draw Left Earring
                drawEarring(ctx, landmarks[EAR_INDEX_LEFT], videoWidth, videoHeight);
                // Draw Right Earring
                drawEarring(ctx, landmarks[EAR_INDEX_RIGHT], videoWidth, videoHeight);
            }
        }
        ctx.restore();
    };

    const drawEarring = (ctx, landmark, width, height) => {
        if (!landmark) return;

        const x = landmark.x * width;
        const y = landmark.y * height;

        // Simple placeholder circle for now if image fails
        // In reality, drawImage with product.image
        // Use a generic placeholder image or shape for demonstration
        ctx.beginPath();
        ctx.arc(x, y + 20, 10, 0, 2 * Math.PI); // Offset slightly down
        ctx.fillStyle = "gold";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.stroke();

        /* 
        // Image logic for later polish:
        const img = new Image();
        img.src = product.image || placeholder;
        ctx.drawImage(img, x - 15, y, 30, 30);
        */
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden shadow-2xl border border-stone-800">
                <Webcam
                    ref={webcamRef}
                    mirrored={true}
                    className="absolute inset-0 w-full h-full object-cover opacity-0" // Hide webcam, show canvas
                />
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                />

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        <div className="animate-pulse">Loading Magic Mirror...</div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-white/80 text-sm bg-black/40 inline-block px-4 py-2 rounded-full backdrop-blur-md">
                        Trying on: <span className="font-bold text-white">{product?.name || "Earrings"}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VirtualTryOn;
