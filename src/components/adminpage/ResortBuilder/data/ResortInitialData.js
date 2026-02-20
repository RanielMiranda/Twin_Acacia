const resortInitialData = {
  name: "Resort name",
  location: "Calamba, Laguna",
  price: 28000,
  contactPhone: "+63 111 111 1111",
  contactEmail: "info@resort.com",
  contactMedia: "https://facebook.com/resort",
  profileImage:
    "",

  description: {
    summary:
      "description."
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
    ""
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
        ""
      ],
      tags: ["Airconditioned", "Toilet"]
    }
  ]
};

export default resortInitialData;
