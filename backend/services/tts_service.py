from gtts import gTTS
import os
import uuid

AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'static', 'audio')

if not os.path.exists(AUDIO_DIR):
    os.makedirs(AUDIO_DIR)

def text_to_speech(text, lang='en'):
    try:
        # gTTS supports 'en', 'ta' (Tamil), 'hi' (Hindi), etc.
        tts = gTTS(text=text, lang=lang, slow=False)
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)
        tts.save(filepath)
        return filename
    except Exception as e:
        print(f"TTS Error: {e}")
        return None
