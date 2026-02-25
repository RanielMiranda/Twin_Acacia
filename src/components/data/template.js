const resorts = [
  {
    id: 1,
    name: "Resort Name",
    location: "Location",
    price: 28000,
    contactPhone: "+63 111 111 1111",
    contactEmail: "email@gmail.com",
    contactMedia: "https://facebook.com/profile",
    profileImage: "profile-image-url",
    description: {
      summary: "Short text summary of the resort."
    },
    extraServices: [
      { name: "Catering", description: "Service description", cost: 3500 },
      { name: "Sound System", description: "Service description", cost: 1500 }
    ],
    facilities: [
      { name: "Swimming Pool", image: "facility-image-url" },
      { name: "Videoke", image: "facility-image-url" }
    ],
    tags: ["Swimming Pool", "Videoke", "Kitchen"],
    gallery: ["gallery-image-url-1", "gallery-image-url-2"],
    rooms: [
      {
        id: 101,
        name: "Room A",
        guests: 6,
        beds: "3 Queen Size Beds",
        price: 5203,
        details: "Short room details",
        gallery: ["room-image-url-1", "room-image-url-2"],
        tags: ["Airconditioned", "Toilet", "Bath", "Blankets"]
      },
      {
        id: 102,
        name: "Room B",
        guests: 8,
        beds: "4 Queen Size Beds",
        price: 5800,
        details: "Short room details",
        gallery: ["room-image-url-1", "room-image-url-2"],
        tags: ["Airconditioned", "Toilet", "Bath", "Blankets"]
      },
      // Add more rooms as needed
    ]
  }
];