const resortInitialData = {
  name: "Resort name",
  location: "Calamba, Laguna",
  price: 28000,
  contactPhone: "+63 111 111 1111",
  contactEmail: "info@resort.com",
  contactMedia: "https://facebook.com/resort",
  profileImage:
    "",
  payment_image_url: null,
  bank_payment_image_url: null,

  description: {
    summary:
      "description.",
    meta: {
      pricing: {
        forAsLowAs: 0,
        customOfferLabel: "",
        customOfferPrice: 0,
      },
    },
    theme: {
      name: "Default",
      primaryColor: "#2563eb",
    },
  },

  extraServices: [
    { name: "Service", description: "Example Description", cost: 3500 },
  ],

  facilities: [
    {
      name: "Swimming Pool",
      image:
        ""
    },
  ],

  tags: [""],

  gallery: [
    "https://cibirdplhynnpqctcjzj.supabase.co/storage/v1/object/public/resort-images/kasbah-villa---hot-spring-resort/hero/1771915023358-gallery-1.jpg"
  ],

  rooms: [
    {
      id: 1,
      name: "Room A",
      guests: 6,
      beds: "3 Queen Size Beds",
      price: 5200,
      details: "Airconditioned suite with garden view.",
      gallery: [
        "https://cibirdplhynnpqctcjzj.supabase.co/storage/v1/object/public/resort-images/kasbah-villa---hot-spring-resort/rooms/room-a/1771915025945-room-acd-1.jpg"
      ],
      tags: ["Air Conditioning", "Toilet", "Bath", "Blanket"] 
    }
  ]
};

export default resortInitialData;
