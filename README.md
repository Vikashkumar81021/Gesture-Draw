# 🖐️ AirDraw – Draw in the Air Using Hand Gestures

**AirDraw** is an AI-powered **gesture-controlled drawing app** built with **React**,and **MediaPipe Hands**.  
It lets you **draw in mid-air using just your hand** — no mouse, no touch, no stylus required! 🎨  

---

## ✨ Features

- ✍️ **Draw with your index finger** in the air  
- ✌️ **Change colors** using two fingers  
- 🖐️ **Add spaces** with an open palm  
- ✊ **Pause drawing** with a closed fist  
- 🤟 **Clear the canvas** with a three-finger gesture  
- 🎥 **Live hand tracking preview**  
- 🎨 Beautiful, modern **UI with TailwindCSS**

---

## 🎬 Demo

> 🎥 [Watch the full tutorial on YouTube](https://youtu.be/-YqXz44vTSc)

---

## 🧠 How It Works

AirDraw uses **MediaPipe Hands** to detect and track 21 landmarks on your hand in real-time.  
These landmarks are processed to detect specific finger positions, which are mapped to actions like drawing, color change, or clearing the canvas.

**Core Logic:**
- **MediaPipe Hands** → Real-time hand detection & tracking  
- **Gesture Recognition** → Finger positions determine user intent  
- **Canvas Rendering** → Smooth drawing using the HTML5 canvas API  

---

## 🧩 Tech Stack

| Technology | Purpose |
|-------------|----------|
| **React** | UI framework |
| **MediaPipe Hands** | Hand detection & landmark tracking |
| **TailwindCSS** | Styling and layout |
| **Camera Utils** | Webcam integration |

---

## ✋ Gesture Controls

| Gesture | Action |
|----------|--------|
| ☝️ **Index Finger Up** | Draw on canvas |
| ✌️ **Two Fingers Up** | Switch color |
| 🖐️ **Open Palm** | Add space / separator |
| ✊ **Closed Fist** | Stop drawing |
| 🤟 **Three Fingers Up** | Clear canvas |

---

## ⚙️ Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/barmangolap15/Air-Draw-React-App.git
cd Air-Draw-React-App
npm install
npm start
# Gesture-Draw
