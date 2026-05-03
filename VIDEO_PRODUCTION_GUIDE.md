# CodeScribe Video Production Guide
**Companion Document to VIDEO_SCRIPT.md**

---

## 🎯 EXECUTIVE SUMMARY

This guide provides step-by-step instructions for producing a compelling 3-minute demo video for the IBM Bob Hackathon. The video demonstrates CodeScribe's AI-powered documentation generation capabilities while clearly showcasing IBM Watsonx integration.

**Key Success Metrics:**
- ✅ Exactly 3 minutes (180 seconds)
- ✅ Clear IBM Watsonx AI integration demonstration
- ✅ 90+ seconds of live solution demonstration
- ✅ Professional, high-quality presentation
- ✅ Memorable and engaging narrative

---

## 📹 RECORDING WORKFLOW

### Phase 1: Pre-Production (30 minutes)

#### Environment Setup
```bash
# 1. Clean workspace
- Close all unnecessary applications
- Clear desktop of clutter
- Disable notifications (Windows: Focus Assist)
- Close browser tabs except documentation

# 2. VS Code Configuration
- Theme: Dark+ (default dark) or One Dark Pro
- Font Size: 18pt (Settings → Editor: Font Size)
- Zoom Level: 150% (View → Appearance → Zoom In)
- Enable Cursor Highlight: Settings → Cursor Blinking: smooth
- Minimap: Disabled (cleaner look)
- Breadcrumbs: Enabled (shows file path)

# 3. Prepare Demo Files
- demo/sample_functions.py (undocumented function)
- demo/coverage_test.py (50% coverage)
- demo/coverage_test.js (multi-language demo)
- demo/CoverageTest.java (Java example)
- demo/coverage_test.cpp (C++ example)
```

#### Recording Software Setup
**Recommended: OBS Studio (Free)**
```
Settings:
- Resolution: 1920x1080 (1080p)
- Frame Rate: 60 FPS
- Bitrate: 8000 Kbps
- Audio: 192 Kbps, 48kHz
- Format: MP4 (H.264)

Scene Setup:
- Source: Display Capture (full screen)
- Audio: Microphone input
- Filters: Noise Suppression, Gain
```

**Alternative: Camtasia, ScreenFlow, or ShareX**

#### Audio Setup
```
Microphone Settings:
- Position: 6-8 inches from mouth
- Gain: -12dB to -6dB (avoid clipping)
- Pop filter: Recommended
- Room: Quiet, minimal echo

Test Recording:
- Record 30 seconds of narration
- Check for background noise
- Verify audio levels (peaks at -6dB)
- Adjust as needed
```

---

### Phase 2: Recording (60-90 minutes)

#### Recording Strategy: Segment-by-Segment

**Why Segments?**
- Easier to fix mistakes
- Better audio quality per section
- Allows for multiple takes
- Simpler editing process

#### Segment Breakdown

**SEGMENT 1: Hook & Problem (0:00-0:30)**
```
Recording Steps:
1. Open VS Code with messy, undocumented code
2. Scroll through showing lack of documentation
3. Show multiple files quickly (3-4 files)
4. End on a complex undocumented function

Camera Work:
- Start with full screen
- Zoom in on undocumented function (150%)
- Pan across multiple files
- Return to full screen

Narration Recording:
- Record separately for clarity
- Emphasize "pain" and "wasting precious hours"
- Enthusiastic tone on "Meet CodeScribe"
```

**SEGMENT 2: Solution Overview (0:30-0:45)**
```
Recording Steps:
1. Show CodeScribe logo/title card
2. Animate feature list (can add in editing)
3. Show VS Code with extension installed

Visual Options:
- Create title card in PowerPoint/Canva
- Use VS Code welcome screen
- Show extension in marketplace

Narration:
- Professional, confident tone
- Emphasize "IBM Watsonx" clearly
- Stress "simple right-click"
```

**SEGMENT 3: Core Demo (0:45-1:30)**
```
Recording Steps:
1. Open demo/sample_functions.py
2. Show calculate_sum function (undocumented)
3. Place cursor inside function
4. Right-click → "Generate Docs & Tests"
5. Wait for panel (show loading)
6. Switch between tabs (Docstring, Tests)
7. Click "Insert Docstring"
8. Show docstring appearing
