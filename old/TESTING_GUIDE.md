# 🧠 Learnonauts Neurodivergent Features - TESTING GUIDE

## 🚀 **READY TO TEST!** 
The Learnonauts application is now running at: **http://localhost:5177/**

---

## 🔧 **HOW TO ACCESS ACCESSIBILITY FEATURES**

### Step 1: Open the Accessibility Panel
1. **Look for the 🔧 button** in the top-right corner of any page
2. **Click the 🔧 button** to open the comprehensive accessibility settings panel
3. You should see a beautiful modal with 5 tabs: **Visual | Audio | Reading | Focus | Controls**

---

## 🎯 **TESTING EACH FEATURE**

### 📱 **TAB 1: VISUAL SETTINGS**
**What to test:**
- **Font Sizes**: Try Small → Medium → Large → Extra-Large
- **Color Themes**: 
  - Switch to "Dyslexia-Friendly" (should load OpenDyslexic font)
  - Try "Autism-Friendly" (calming colors)
  - Test "High Contrast" mode
- **Dark Mode**: Toggle on/off
- **Reduced Motion**: Enable to stop animations
- **High Contrast**: Makes everything more visible

**Expected Results:**
- Font size changes should be immediate
- Dyslexia theme shows different font family
- Dark mode changes background colors
- High contrast makes borders/text stronger

### 🔊 **TAB 2: AUDIO SETTINGS**
**What to test:**
- **Sound Toggle**: Turn sound on/off
- **Speech Speed**: Adjust from 0.5x to 2x
- **Test Voice Button**: Click to hear sample speech

**Expected Results:**
- Test Voice button should speak: "This is how fast I will speak to help you learn!"
- Speed slider should change the voice speed
- Sound toggle should enable/disable all audio

### 📖 **TAB 3: READING SUPPORT**
**What to test:**
- **Reading Guide Line**: Toggle on to highlight text as you read
- **Letter Spacing**: Try Normal → Wide → Extra-Wide
- **Line Spacing**: Normal → Relaxed → Loose
- **Color Overlays**: Blue, Yellow, Green, Pink reading filters

**Expected Results:**
- Reading guide should highlight paragraphs as you scroll
- Text spacing should make letters more spread out
- Line spacing should increase space between lines
- Color overlays should tint the background

### 🧠 **TAB 4: FOCUS & ATTENTION (ADHD Support)**
**What to test:**
- **Reduce Distractions**: Hides decorative elements
- **Simplified Interface**: Clean, minimal design
- **Visible Timer**: Shows focus session timers
- **Break Reminders**: Enable 20-minute break alerts
- **Sensory Breaks**: Calming activities between lessons
- **Error Message Style**: Gentle vs Encouraging vs Standard
- **Information Density**: Minimal → Reduced → Full

**Expected Results:**
- Break reminders should show popup every 20 minutes
- Sensory breaks offer 5 activities (breathing, stretching, etc.)
- Error styles change how messages appear
- Simplified UI removes visual complexity

### 🖱️ **TAB 5: CONTROLS**
**What to test:**
- **Focus Indicator**: Enhanced keyboard navigation
- **Feedback Style**: Immediate vs Delayed vs Summary

---

## 🎮 **TESTING IN GAMES**

### 🔍 **Classification Game** (Living vs Non-Living)
1. **Access**: Home → Learn AI Concepts → Classification
2. **Test Features**:
   - Try different error handling styles
   - Use the **🧠 Demo Neurodivergent-Friendly Error** button
   - Test with break reminders enabled
   - Try different visual themes while playing

### 🧩 **Clustering Game** (Pattern Detection)
1. **Access**: Home → Learn AI Concepts → Clustering  
2. **Test Features**:
   - Enable reading support and see how it affects instructions
   - Try simplified UI mode
   - Test with different font sizes

---

## 🔍 **SPECIFIC NEURODIVERGENT FEATURES TO TEST**

### 🧠 **For ADHD Testing:**
1. **Enable Break Reminders** (Focus tab)
2. **Turn on Sensory Breaks** (Focus tab)
3. **Enable Visible Timer** (Focus tab)
4. **Wait 20 minutes** → Should see break reminder popup
5. **Try Sensory Break Activities**:
   - 🫁 Deep Breathing (30 seconds)
   - 🤸 Quick Stretch (45 seconds)
   - 💧 Hydration Break (15 seconds)
   - 👀 Eye Rest (20 seconds)
   - 🧘 Mindful Moment (60 seconds)

### 👁️ **For Dyslexia Testing:**
1. **Switch to Dyslexia-Friendly theme** (Visual tab)
2. **Increase Letter Spacing** to Extra-Wide (Reading tab)
3. **Set Line Spacing** to Loose (Reading tab)
4. **Enable Reading Guide** (Reading tab)
5. **Try Color Overlays** - many find yellow helpful (Reading tab)

### 🎨 **For Autism Testing:**
1. **Switch to Autism-Friendly colors** (Visual tab)
2. **Enable Simplified UI** (Focus tab)
3. **Set Error Handling** to Gentle (Focus tab)
4. **Reduce Information Density** to Minimal (Focus tab)
5. **Enable Reduced Motion** (Visual tab)

### 🎧 **For Audio Processing:**
1. **Adjust Speech Speed** to comfortable level (Audio tab)
2. **Test voice feedback** in games
3. **Try error messages** with different styles + audio

---

## 🐛 **WHAT TO CHECK IF FEATURES DON'T WORK**

### ❌ **If 🔧 Button Doesn't Open Panel:**
- Check browser console for errors (F12 → Console)
- Try refreshing the page
- Make sure you're clicking the settings button, not other icons

### ❌ **If Speech Doesn't Work:**
- Check if browser supports Web Speech API
- Make sure sound is enabled in Audio tab
- Try different browsers (Chrome/Edge work best for speech)

### ❌ **If Fonts Don't Change:**
- Some fonts may take time to load
- Try refreshing after changing font settings
- Check if browser blocks external font loading

### ❌ **If Break Reminders Don't Show:**
- Make sure you enabled them in Focus tab
- Wait the full interval (20 minutes by default)
- Check if browser notifications are blocked

---

## 🎉 **SUCCESS INDICATORS**

You'll know the features are working when you see:
- ✅ Accessibility panel opens with 5 tabs
- ✅ Font sizes change immediately
- ✅ Speech synthesis works (test voice button)
- ✅ Break reminders appear as popups
- ✅ Visual themes change colors/fonts
- ✅ Reading support affects text display
- ✅ Error handling styles change message appearance
- ✅ Games respond to accessibility settings

---

## 🧪 **ADVANCED TESTING**

### 🔄 **Settings Persistence:**
1. Change multiple accessibility settings
2. Refresh the page
3. Check if settings are remembered

### 🎮 **Cross-Game Testing:**
1. Set accessibility preferences
2. Play different games
3. Verify settings apply consistently

### 🎯 **Error Testing:**
1. Set error style to "Gentle"
2. Click demo error button in Classification game
3. Should see soft, reassuring error message
4. Change to "Encouraging" style
5. Try again - should see positive, motivational message

---

## 📞 **FEEDBACK & REPORTING**

If you find any issues or have suggestions:
1. Note which feature isn't working
2. Check browser console for errors
3. Try in different browsers
4. Document steps to reproduce

**The platform now supports comprehensive neurodivergent accessibility! 🌟**
