# Product Requirements Document (PRD) - PrettyYou

## 1. Executive Summary
**PrettyYou** is an immersive e-commerce web application specializing in jewelry (specifically earrings). It differentiates itself from standard online stores by integrating advanced interactive features: an **AI Stylist** that recommends products based on user context (occasion, outfit) and a **Virtual Try-On** feature leveraging Augmented Reality (AR) to allow users to visualize products on their own ears in real-time.

## 2. Product Scope
The current version (MVP) focuses on a curated catalog of earrings, enabling users to browse, get recommendations, virtually try on items, and proceed to checkout.

## 3. User Personas
*   **The Occasion Shopper:** Needs specific jewelry for an event (wedding, party, office) but isn't sure what matches. Uses the *AI Stylist*.
*   **The Visualizer:** Wants to see how jewelry looks on them before buying to judge size and style. Uses *Virtual Try-On*.
*   **The Window Shopper:** Enjoys browsing beautiful product collections and interactive web experiences.

## 4. Functional Requirements

### 4.1. Core E-commerce
*   **Product Catalog:** Users can browse a list of products with images, names, and prices.
*   **Product Details:** detailed view of a specific product, including material, weight, dimensions, and description.
*   **Shopping Cart:** Ability to add items to a cart and view the cart summary (managed via `CartContext`).
*   **Checkout:** A process to collect user shipping/payment info (simulated or integrated) and finalize the order.

### 4.2. AI Stylist (`/stylist`)
*   **Chat Interface:** A conversational UI where the user ("User") and the stylist ("Assistant") exchange messages.
*   **Contextual Recommendation:** The AI analyzes user input for keywords (e.g., "party", "wedding", "work") to recommend specific product categories (gold, silver, gemstone).
*   **Product Cards in Chat:** Recommendations are displayed as interactive product cards within the chat stream, allowing direct navigation to the product.
*   **Personality:** The AI adopts a "personal stylist" persona (polite, helpful, fashion-forward).

### 4.3. Virtual Try-On (AR)
*   **Webcam Access:** Request and utilize user webcam permissions.
*   **Face Tracking:** Use `MediaPipe Face Mesh` to detect facial landmarks in real-time.
*   **AR Overlay:** Accurately position 2D earring assets on specific ear landmarks (Indices 234 & 454).
*   **Live Preview:** Render the camera feed with the overlaid assets on a canvas.
*   **Privacy:** Process video streams locally in the browser; no video data is sent to a server.

## 5. Non-Functional Requirements
*   **Performance:** AR features must run smoothly (targeting 30fps) on standard consumer devices.
*   **Responsiveness:** UI must adapt to Mobile (iPhone/Pixel) and Desktop viewports.
*   **Privacy:** Explicitly handle webcam permissions and ensure user trust (local processing).

## 6. Technical Architecture
*   **Frontend Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS (v4) + Framer Motion (for animations/transitions)
*   **AR-Engine:** `@mediapipe/face_mesh` + `@mediapipe/camera_utils`
*   **State Management:** React Context API (`CartContext`)
*   **Routing:** React Router v7
*   **Hosting:** Firebase Hosting

## 7. Future Roadmap
*   **3D Models:** Replace 2D overlays with 3D models (`Three.js` / `React Three Fiber`) for realistic rotation and lighting.
*   **Auth:** User accounts to save "Liked" items or chat history.
*   **Payment Gateway:** Integration with Stripe/Razorpay for real payments.
