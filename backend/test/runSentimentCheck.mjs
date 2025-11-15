import { classifyFeedback } from "../utils/sentimentAnalyzer.js";

// Diverse sample statements to validate negative, neutral, and positive tones.
const samples = [
  {
    text: "Hindi ako makapasok sa gymmate, lagi akong nasa queue",
    note: "expected negative",
  },
  {
    text: "Service keeps failing whenever peak hours hit the gym",
    note: "expected negative",
  },
  {
    text: "Nagsi-crash talaga ang booking page kapag marami ang gumagamit",
    note: "expected negative",
  },
  {
    text: "Ayos lang naman ang sistema, wala akong gaanong napansin",
    note: "expected neutral",
  },
  {
    text: "The app is okay overall, nothing really stands out",
    note: "expected neutral",
  },
  {
    text: "Notifications arrive as expected, walang kakaiba",
    note: "expected neutral",
  },
  {
    text: "Support responses are acceptable, hindi naman mabilis o mabagal",
    note: "expected neutral",
  },
  {
    text: "Mabilis at maayos ang proseso kaya masaya ako",
    note: "expected positive",
  },
  {
    text: "The interface is user-friendly and I am very happy using it",
    note: "expected positive",
  },
  {
    text: "Nagustuhan ko ang bagong layout, mas madali ngayon mag-navigate",
    note: "expected positive",
  },
  {
    text: "Hindi naka-center ang ilang buttons kapag ginagamit ko ang phone ko.",
    note: "expected neutral",
  },
  {
    text: "The time in button stays disabled when I arrive at the facility.",
    note: "expected negative",
  },
  {
    text: "Appreciate how easy it is to review my profile info from the account page.",
    note: "expected positive",
  },
  {
    text: "Salamat sa mabilis na pag-update ng queue, hindi na ako nagaalala sa pila.",
    note: "expected positive",
  },
  {
    text: "The mobile experience feels snappy and responsive on my phone now.",
    note: "expected positive",
  },
  {
    text: "Gusto ko ang calendar view, mas madali nang pumili ng available slot.",
    note: "expected positive",
  },
  {
    text: "Uploaded AR images look crisp after the recent update. Kudos to the team!",
    note: "expected positive",
  },
  {
    text: "Ang dali na mag-book ng slot—ganda ng bagong disenyo!",
    note: "expected positive",
  },
  {
    text: "Hindi tumutugma ang napiling oras sa schedule na ipinapakita sa kalendaryo.",
    note: "expected negative",
  },
  {
    text: "Nag-double book ang reservation ko kahit isang beses lang ako nag-submit.",
    note: "expected negative",
  },
  {
    text: "Unable to secure a slot for tomorrow even though slots appear available.",
    note: "expected negative",
  },
  {
    text: "Hindi ko ma-edit ang ilang detalye sa account ko tulad ng course at year.",
    note: "expected negative",
  },
  {
    text: "Malabo ang kuhang AR image kahit malinaw naman ang orihinal na file.",
    note: "expected negative",
  },
  {
    text: "Password reset email never arrives in my inbox.",
    note: "expected negative",
  },
  {
    text: "Great job team! GymMate keeps getting better every release.",
    note: "expected positive",
  },
  {
    text: "The new booking flow is smooth—confirmation arrives instantly now. Great work!",
    note: "expected positive",
  },
];

const run = async () => {
  for (const sample of samples) {
    const sentiment = await classifyFeedback(sample.text);
    console.log(`${sample.text} (${sample.note}) => ${sentiment}`);
  }
  process.exit(0);
};

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
