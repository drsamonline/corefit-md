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
      videoId: 'wiFNA3sqn3M',
      backupIds: [],
      clip: { start: 30, end: 55 },
      work: 50, rest: 10, mode: 'time', reps: 0, unilateral: true,
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
    duration: 45,
    cues: [
      { at: 0,  en: 'Stand tall. Roll the shoulders back and breathe in through the nose.', hi: 'सीधे खड़े हों। कंधे पीछे घुमाएँ।', gu: 'સીધા ઊભા રહો. ખભા પાછળ ફેરવો.' },
      { at: 15, en: 'Cat–cow: arch and round the spine, four slow rounds.', hi: 'कैट-काउ: रीढ़ को धीरे-धीरे मोड़ें।', gu: 'કેટ-કાઉ: કરોડરજ્જુ ધીમે વાળો.' },
      { at: 30, en: 'Glute bridge: lift the hips, squeeze, lower. Six slow reps.', hi: 'ग्लूट ब्रिज: कूल्हे उठाएँ, दबाएँ, नीचे लाएँ।', gu: 'ગ્લૂટ બ્રિજ: હિપ ઉપાડો, દબાવો, નીચે લાવો.' }
    ]
  };

  CF.COOLDOWN = {
    id: 'cooldown',
    duration: 45,
    cues: [
      { at: 0,  en: 'Knees to chest. Rock gently. Let the abs switch off.', hi: 'घुटने छाती की ओर। धीरे झूलें।', gu: 'ઘૂંટણ છાતી તરફ. ધીમે હલાવો.' },
      { at: 15, en: 'Child’s pose. Breathe out longer than you breathe in.', hi: 'चाइल्ड पोज़। साँस छोड़ना लंबा रखें।', gu: 'ચાઇલ્ડ પોઝ. શ્વાસ છોડવો લાંબો રાખો.' },
      { at: 30, en: 'Sit tall, one hand on the ribs. Five calm breaths.', hi: 'सीधे बैठें, एक हाथ पसलियों पर। पाँच शांत साँसें।', gu: 'સીધા બેસો, એક હાથ પસંદડી પર. પાંચ શાંત શ્વાસ.' }
    ]
  };
})(window.CF = window.CF || {});
