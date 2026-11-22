/* =====================================================================
   GROOM-SIDE WEDDING CONFIGURATION: the one file you edit.
   ---------------------------------------------------------------------
   Everything guests read (names, hosts, functions, venue, picture and
   music paths) lives here. You never need to touch index.html,
   style.css or script.js to update details.

   • Leave a value as "" when you don't have it; the site hides it.
   • Dates use the format YYYY-MM-DD.
   • Paths are relative to index.html, e.g. "assets/images/fn-chak.webp"
   ===================================================================== */

window.WEDDING_CONFIG = {
  couple: {
    groom: "Jatin",
    bride: "Shreya",
    groomHindi: "जतिन",
    brideHindi: "श्रेया",
    initials: "J & S",
    hashtag: "#JatinWedsShreya"
  },

  /* The hosts, shown under the Ganesh blessing */
  hosts: {
    line: "Smt. Manju & Shri Sanjeev Lakhmera",
    invite: "invite you to the wedding of their beloved son",
    signOff: "The Lakhmera Family"
  },

  /* Main screen date and the countdown target (India time) */
  weddingDateText: "Friday, 4th December 2026",
  countdownTarget: "2026-12-04T00:00:00+05:30",

  /* Background music: starts only after the guest opens the letter */
  media: {
    music: "assets/audio/wedding-music.mp3"
  },

  /* Artwork. Leave any path "" to fall back to the built-in line drawing. */
  images: {
    heroMobile:  "assets/images/hero-mobile.webp",
    heroDesktop: "assets/images/hero-desktop.webp",
    couple:      "assets/images/couple.webp",
    garland:     "assets/images/garland.webp",
    venue:       "assets/images/venue.webp",
    paper:       "assets/images/paper.webp",
    corner:      "assets/images/corner.webp"
  },

  /* ---------------- Functions ----------------
     Shown in this order. Functions on the same date are grouped as one day.
     image: illustration (square, transparent works best). Leave "" to use the line drawing.
     motif: line drawing used when there's no image — one of
       kalash, patrika, sangeet, mehendi, haldi, chak, potli, horse, lantern            */
  functions: [
    { name: "Ganesh Pujan",     date: "2026-11-30", day: "Monday",    time: "7:15 AM",         location: "Residence", motif: "kalash",  image: "assets/images/fn-vinayak.webp" },
    { name: "Lagna Patrika",    date: "2026-11-30", day: "Monday",    time: "9:15 AM",         location: "Residence", motif: "patrika", image: "assets/images/fn-lagna-patrika.webp" },
    { name: "Mahila Sangeet",   date: "2026-12-01", day: "Tuesday",   time: "2:00 PM",         location: "Residence", motif: "sangeet", image: "assets/images/fn-ladies-sangeet.webp" },
    { name: "Mehendi",          date: "2026-12-02", day: "Wednesday", time: "11:00 AM",        location: "Residence", motif: "mehendi", image: "assets/images/fn-mehendi.webp" },
    { name: "Haldi & Baan",     date: "2026-12-03", day: "Thursday",  time: "9:15 AM",         location: "Treehouse Rajbagh, Jodhpur", motif: "haldi",   image: "assets/images/fn-haldi.webp" },
    { name: "Chhaak",           date: "2026-12-03", day: "Thursday",  time: "2:15 PM",         location: "Treehouse Rajbagh, Jodhpur", motif: "chak",    image: "assets/images/fn-chak.webp" },
    { name: "Bhat",             date: "2026-12-03", day: "Thursday",  time: "4:00 PM",         location: "Treehouse Rajbagh, Jodhpur", motif: "potli",   image: "assets/images/fn-mayra.webp" },
    { name: "Baraat Prasthan (Wedding Procession Departure)", date: "2026-12-04", day: "Friday", time: "10:00 AM", location: "Treehouse Rajbagh, Jodhpur", motif: "horse", image: "assets/images/fn-barat.webp" },
    { name: "Reception",        date: "2026-12-04", day: "Friday",    time: "7:00 PM onwards", location: "Treehouse Rajbagh, Jodhpur", motif: "lantern", image: "assets/images/fn-reception.webp", framed: true }
  ],

  /* ---------------- Wedding venue ----------------
     mapsUrl: leave "" to search Google Maps for the name + address,
     or paste a Google Maps share link for an exact pin. */
  venue: {
    name: "Tree House Rajbagh Heritage Hotel",
    address: "Near Dali Bai Circle, Jhanwar Road,\nJodhpur, Rajasthan",
    mapsUrl: ""
  },

  closing: {
    line1: "Your presence will make our day special.",
    line2: "We look forward to celebrating with you."
  }
};
