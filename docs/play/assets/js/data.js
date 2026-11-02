/* CoreFit MD — exercise library, programme data and warm-up / cool-down cues.
   Clip windows: start = 30s by default (the demonstration mark), end = start + 25s.
   Every value here is editable at runtime from the Library sheet and stored per device. */
(function (CF) {
  'use strict';

  CF.EXERCISES = [
    {
      id: 'plank',
      name: { en: 'Forearm Plank', hi: 'फोरआर्म प्लैंक', gu: 'ફોરઆર્મ પ્લાંક' },
      videoId: 'ASdvN_XEl_c',
      backupIds: [],
      clip: { start: 30, end: 55 },
      work: 50, rest: 10, mode: 'time', reps: 0, unilateral: false,
      demo: 'assets/demo/plank.svg',
      credit: { title: 'Planks for Beginners', author: 'BowFlex', url: 'https://www.youtube.com/watch?v=ASdvN_XEl_c' },
      cue: {
        en: 'Elbows under shoulders, one straight line from head to heels.',
        hi: 'कोहनियाँ कंधों के नीचे, सिर से एड़ी तक एक सीधी रेखा।',
        gu: 'કોણી ખભાની નીચે, માથાથી એડી સુધી એક સીધી રેખા.'
      },
      steps: [
        'Forearms down, elbows directly under the shoulders.',
        'Lift the hips until head, hips and heels line up.',
        'Squeeze abs, glutes and quads; tuck the ribs down.',
        'Breathe steadily — no sagging hips, no piked back.'
      ],
      regression: { en: 'Incline plank: forearms on a bench or the sofa seat.', hi: 'इंक्लाइन प्लैंक: कोहनियाँ बेंच पर।', gu: 'ઇન્ક્લાઇન પ્લાંક: કોણી બેન્ચ પર.' },
      progression: { en: 'Long-lever plank: elbows further forward.', hi: 'लॉन्ग-लीवर प्लैंक: कोहनियाँ आगे।', gu: 'લોંગ-લીવર પ્લાંક: કોણી આગળ.' }
    },
    {
      id: 'deadbug',
      name: { en: 'Dead Bug', hi: 'डेड बग', gu: 'ડેડ બગ' },
      videoId: '4XLEnwUr1d8',
      backupIds: [],
      clip: { start: 30, end: 55 },
      work: 50, rest: 10, mode: 'time', reps: 10, unilateral: false,
      demo: 'assets/demo/deadbug.svg',
      credit: { title: 'Dead Bug — Abdominal / Core Exercise Guide', author: 'Bodybuilding.com', url: 'https://www.youtube.com/watch?v=4XLEnwUr1d8' },
      cue: {
        en: 'Low back glued to the mat the whole way through.',
        hi: 'पूरे समय कमर फर्श से चिपकी रहे।',
        gu: 'આખો સમય કમર જમીન સાથે ચીપેલી રહે.'
      },
      steps: [
        'Lie on your back, arms to the ceiling, knees at 90°.',
        'Press the lower back flat into the mat.',
        'Lower the right arm and left leg together, slowly.',
        'Return with control, then switch sides.'
      ],
      regression: { en: 'Feet supported: heels stay on the floor throughout.', hi: 'पैर टिका हुआ: एड़ियाँ फर्श पर रहें।', gu: 'પગ ટેકવેલા: એડી જમીન પર રહે.' },
      progression: { en: 'Heels hover 5 cm off the floor at full extension.', hi: 'पूरी स्ट्रेच पर एड़ियाँ 5 सेमी ऊपर।', gu: 'પૂરા વિસ્તારમાં એડી 5 સેમી ઉપર.' }
    },
    {
      id: 'birddog',
      name: { en: 'Bird Dog', hi: 'बर्ड डॉग', gu: 'બર્ડ ડોગ' },
      videoId: 'G4mX4StOvQE',
      backupIds: ['k2azbhhuKuM'],
      clip: { start: 30, end: 55 },
      work: 50, rest: 10, mode: 'time', reps: 0, unilateral: true,
      demo: 'assets/demo/birddog.svg',
      credit: { title: 'The Bird Dog Exercise — Beginner and Standard', author: 'Dr. Brian Abelson, Kinetic Health', url: 'https://www.youtube.com/watch?v=G4mX4StOvQE' },
      cue: {
        en: 'Long from fingertip to heel — hips stay level.',
        hi: 'उँगली से एड़ी तक लंबा — कूल्हे समान रहें।',
        gu: 'આંગળીથી એડી સુધી લાંબું — હિપ સમાન રહે.'
      },
      steps: [
        'On all fours: hands under shoulders, knees under hips.',
        'Reach the right arm forward and the left leg back.',
        'Keep the hips square; do not let the low back arch.',
        'Pause, return, then alternate sides.'
      ],
      regression: { en: 'Leg only: keep both hands on the floor.', hi: 'केवल पैर: दोनों हाथ फर्श पर।', gu: 'ફક્ત પગ: બંને હાથ જમીન પર.' },
      progression: { en: 'Hold 3 s at full extension before returning.', hi: 'पूरी स्ट्रेच पर 3 सेकंड रुकें।', gu: 'પૂરા વિસ્તારમાં 3 સેકન્ડ થોભો.' }
    },
    {
      id: 'bicycle',
      name: { en: 'Bicycle Crunch', hi: 'बाइसिकल क्रंच', gu: 'બાઇસિકલ ક્રન્ચ' },
      videoId: '9FGilxCbdz8',
      backupIds: [],
      clip: { start: 30, end: 55 },
      work: 50, rest: 10, mode: 'time', reps: 16, unilateral: false,
      demo: 'assets/demo/bicycle.svg',
      credit: { title: 'How to Do the Bicycle', author: 'LIVESTRONG', url: 'https://www.youtube.com/watch?v=9FGilxCbdz8' },
      cue: {
        en: 'Rotate from the ribs, not the neck. Elbows stay wide.',
        hi: 'पसलियों से घुमाएँ, गर्दन से नहीं। कोहनियाँ खुली रखें।',
        gu: 'પસંદડીથી ફરો, ગરદનથી નહીં. કોણી ખુલ્લી રાખો.'
      },
      steps: [
        'Lie on your back, hands lightly behind the head.',
        'Lift the shoulders and both feet off the floor.',
        'Bring the right elbow toward the left knee.',
        'Pedal smoothly, alternating sides without rushing.'
      ],
      regression: { en: 'Supine march: no rotation, one heel slides out.', hi: 'सुपाइन मार्च: बिना घुमाव।', gu: 'સુપાઇન માર્ચ: ફરવા વિના.' },
      progression: { en: 'Slow to a 3-second count per side.', hi: 'प्रति साइड 3 सेकंड की गति।', gu: 'દરેક બાજુ 3 સેકન્ડની ગતિ.' }
    },
    {
      id: 'hollow',
      name: { en: 'Hollow Body Hold', hi: 'हॉलो बॉडी होल्ड', gu: 'હોલો બોડી હોલ્ડ' },
      videoId: 'LlDNef_Ztsc',
      backupIds: [],
      clip: { start: 30, end: 55 },
      work: 50, rest: 10, mode: 'time', reps: 0, unilateral: false,
      demo: 'assets/demo/hollow.svg',
      credit: { title: 'Hollow Body Hold Progression', author: 'GMB Fitness', url: 'https://www.youtube.com/watch?v=LlDNef_Ztsc' },
      cue: {
        en: 'Ribs down, low back flat — a shallow banana, not a deep arch.',
        hi: 'पसलियाँ नीचे, कमर सपाट — गहरा मोड़ नहीं।',
        gu: 'પસંદડી નીચે, કમર સપાટ — ઊંડો વળાંક નહીં.'
      },
      steps: [
        'Lie on your back, arms overhead, legs straight.',
        'Flatten the lower back into the mat — no gap.',
        'Lift the arms, shoulders and legs a few centimetres.',
        'Hold with the chin tucked; bend the knees to scale down.'
      ],
      regression: { en: 'Bent knees at 90°, shins parallel to the floor.', hi: 'घुटने 90° पर मोड़ें।', gu: 'ઘૂંટણ 90° પર વાળો.' },
      progression: { en: 'Straight legs, arms by the ears, 3 s lower.', hi: 'सीधे पैर, हाथ कानों के पास।', gu: 'સીધા પગ, હાથ કાન પાસે.' }
    }
  ];

  // Warm-up and cool-down run on a cue clock rather than a clip.
  CF.WARMUP = {
    id: 'warmup',
    demo: 'assets/demo/warmup.svg',
    duration: 45,
    cues: [
      { at: 0,  en: 'Stand tall. Roll the shoulders back and breathe in through the nose.', hi: 'सीधे खड़े हों। कंधे पीछे घुमाएँ।', gu: 'સીધા ઊભા રહો. ખભા પાછળ ફેરવો.' },
      { at: 15, en: 'Cat–cow: arch and round the spine, four slow rounds.', hi: 'कैट-काउ: रीढ़ को धीरे-धीरे मोड़ें।', gu: 'કેટ-કાઉ: કરોડરજ્જુ ધીમે વાળો.' },
      { at: 30, en: 'Glute bridge: lift the hips, squeeze, lower. Six slow reps.', hi: 'ग्लूट ब्रिज: कूल्हे उठाएँ, दबाएँ, नीचे लाएँ।', gu: 'ગ્લૂટ બ્રિજ: હિપ ઉપાડો, દબાવો, નીચે લાવો.' }
    ]
  };

  CF.COOLDOWN = {
    id: 'cooldown',
    demo: 'assets/demo/cooldown.svg',
    duration: 45,
    cues: [
      { at: 0,  en: 'Knees to chest. Rock gently. Let the abs switch off.', hi: 'घुटने छाती की ओर। धीरे झूलें।', gu: 'ઘૂંટણ છાતી તરફ. ધીમે હલાવો.' },
      { at: 15, en: 'Child’s pose. Breathe out longer than you breathe in.', hi: 'चाइल्ड पोज़। साँस छोड़ना लंबा रखें।', gu: 'ચાઇલ્ડ પોઝ. શ્વાસ છોડવો લાંબો રાખો.' },
      { at: 30, en: 'Sit tall, one hand on the ribs. Five calm breaths.', hi: 'सीधे बैठें, एक हाथ पसलियों पर। पाँच शांत साँसें।', gu: 'સીધા બેસો, એક હાથ પસંદડી પર. પાંચ શાંત શ્વાસ.' }
    ]
  };

  /* Moves that are not in the default session. They exist so the library has
     somewhere to grow without a video dependency — each one ships with its own
     offline demonstration. */
  CF.EXTRA_MOVES = [
    {
      id: 'sideplank',
      name: { en: 'Side Plank', hi: 'साइड प्लैंक', gu: 'સાઇડ પ્લાંક' },
      videoId: 'XeN4pEZZJNI', backupIds: ['rCxF2nG9vQ0'],
      clip: { start: 30, end: 55 },
      credit: { title: 'How To Do A Side Plank | The Right Way', author: 'Well+Good', url: 'https://www.youtube.com/watch?v=XeN4pEZZJNI&t=30s' },
      demo: 'assets/demo/sideplank.svg',
      work: 30, rest: 10, mode: 'time', reps: 0, unilateral: true,
      tag: { en: 'Anti-rotation', hi: 'एंटी-रोटेशन', gu: 'એન્ટી-રોટેશન' },
      cue: {
        en: 'Elbow under shoulder, hips lifted, one line from head to feet.',
        hi: 'कोहनी कंधे के नीचे, कूल्हे ऊपर, सिर से पैर तक एक रेखा।',
        gu: 'કોણી ખભા નીચે, હિપ ઉપર, માથાથી પગ સુધી એક રેખા.'
      },
      steps: [
        'Lie on one side, elbow directly under the shoulder.',
        'Lift the hips until the body is one straight line.',
        'Stack the feet; the top arm reaches to the ceiling.',
        'Hold, breathe, then change sides.'
      ],
      regression: { en: 'Bend the bottom knee to the floor for support.', hi: 'नीचे वाला घुटना फर्श पर टिकाएँ।', gu: 'નીચેનું ઘૂંટણ જમીન પર ટેકવો.' },
      progression: { en: 'Top foot lifted, or the top arm reaching overhead.', hi: 'ऊपर वाला पैर उठाएँ।', gu: 'ઉપરનો પગ ઉપાડો.' }
    },
    {
      id: 'glutebridge',
      name: { en: 'Glute Bridge', hi: 'ग्लूट ब्रिज', gu: 'ગ્લૂટ બ્રિજ' },
      videoId: 'wPM8icPu6H8', backupIds: ['PhTDzR0TpZs'],
      clip: { start: 30, end: 55 },
      credit: { title: 'How To Do A Glute Bridge | The Right Way', author: 'Well+Good', url: 'https://www.youtube.com/watch?v=wPM8icPu6H8&t=30s' },
      demo: 'assets/demo/glutebridge.svg',
      work: 40, rest: 10, mode: 'reps', reps: 12, unilateral: false,
      tag: { en: 'Hip extension', hi: 'हिप एक्सटेंशन', gu: 'હિપ એક્સ્ટેન્શન' },
      cue: {
        en: 'Heels down, ribs down, squeeze the glutes at the top — not the back.',
        hi: 'एड़ियाँ नीचे, पसलियाँ नीचे, ऊपर ग्लूट दबाएँ।',
        gu: 'એડી નીચે, પસંદડી નીચે, ઉપર ગ્લૂટ દબાવો.'
      },
      steps: [
        'Lie on your back, knees bent, heels under the knees.',
        'Press through the heels and lift the hips.',
        'Stop when the hips, knees and shoulders form a line.',
        'Lower slowly; do not arch the low back at the top.'
      ],
      regression: { en: 'Smaller range — lift only a few centimetres.', hi: 'कम ऊँचाई तक उठाएँ।', gu: 'ઓછી ઊંચાઈ સુધી ઉપાડો.' },
      progression: { en: 'One leg extended, or a 3-second hold at the top.', hi: 'एक पैर सीधा रखें।', gu: 'એક પગ સીધો રાખો.' }
    },
    {
      id: 'superman',
      name: { en: 'Superman', hi: 'सुपरमैन', gu: 'સુપરમેન' },
      videoId: 'cc6UVRS7PW4', backupIds: ['cZxtPxeR2H8'],
      clip: { start: 30, end: 55 },
      credit: { title: 'How to Do Superman Exercises', author: 'LIVESTRONG', url: 'https://www.youtube.com/watch?v=cc6UVRS7PW4&t=30s' },
      demo: 'assets/demo/superman.svg',
      work: 30, rest: 10, mode: 'time', reps: 0, unilateral: false,
      tag: { en: 'Spinal extension', hi: 'स्पाइनल एक्सटेंशन', gu: 'સ્પાઇનલ એક્સટેન્શન' },
      cue: {
        en: 'Long neck, ribs down. Lift from the shoulders, not the chin.',
        hi: 'गर्दन लंबी, पसलियाँ नीचे। कंधों से उठाएँ, ठुड्डी से नहीं।',
        gu: 'ગરદન લાંબી, પસંદડી નીચે. ખભાથી ઉપાડો, હડપચીથી નહીં.'
      },
      steps: [
        'Lie face down, arms reaching forward, legs long.',
        'Draw the ribs down and tuck the chin slightly.',
        'Lift the arms, chest and legs a few centimetres.',
        'Hold, then lower with control. No craning the neck.'
      ],
      regression: { en: 'Lift only the arms, or only the legs.', hi: 'केवल हाथ या केवल पैर उठाएँ।', gu: 'ફક્ત હાથ અથવા ફક્ત પગ ઉપાડો.' },
      progression: { en: 'Hold 5 s at the top, or add a small flutter.', hi: 'ऊपर 5 सेकंड रुकें।', gu: 'ઉપર 5 સેકન્ડ થોભો.' }
    }
  ];
})(window.CF = window.CF || {});
