INSERT INTO bookings (
  id,
  resort_id,
  room_ids,
  start_date,
  end_date,
  check_in_time,
  check_out_time,
  status,
  booking_form,
  adult_count,
  children_count,
  pax,
  sleeping_guests,
  room_count,
  inquirer_type,
  resort_service_ids,
  guest_name,
  agent_name,
  staying_guest_name,
  staying_guest_email,
  staying_guest_phone,
  inquirer_email,
  inquirer_phone,
  room_name,
  inquirer_address
)
VALUES

-- 100
(
  100,
  10,
  '[1]',
  '2026-01-05',
  '2026-01-08',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"juan1@gmail.com","roomId":1,"status":"Checked Out","address":"address","roomName":"Room A","agentName":"","guestName":"Juan Dela Cruz","downpayment":18250,"phoneNumber":"09171234567","statusAudit":[{"at":"2026-03-23T05:41:37.027Z","to":"Checked Out","from":"Pending Checkout","actor":"owner-ui","actorId":"6","actorName":"account name","actorRole":"owner"}],"totalAmount":18250,"inquirerType":"client","lastActionBy":"account name","paymentMethod":"Pending","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"","stayingGuestPhone":"","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,4,1,false,
  ARRAY['b7c963d4-b0b1-426d-9f86-5e06a630c916'],
  'Juan Dela Cruz','','','','',
  'juan1@gmail.com','09171234567',
  'Room A','address'
),

-- 101
(
  101,
  10,
  '[1]',
  '2026-01-10',
  '2026-01-13',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"maria@gmail.com","roomId":1,"status":"Checked Out","address":"address","roomName":"Room A","agentName":"","guestName":"Maria Santos","downpayment":18250,"phoneNumber":"09181234567","statusAudit":[{"at":"2026-03-23T05:41:37.027Z","to":"Checked Out","from":"Pending Checkout","actor":"owner-ui","actorId":"6","actorName":"account name","actorRole":"owner"}],"totalAmount":18250,"inquirerType":"client","lastActionBy":"account name","paymentMethod":"Pending","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"","stayingGuestPhone":"","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,4,1,false,
  ARRAY['b7c963d4-b0b1-426d-9f86-5e06a630c916'],
  'Maria Santos','','','','',
  'maria@gmail.com','09181234567',
  'Room A','address'
),

-- 102
(
  102,
  10,
  '[1]',
  '2026-01-18',
  '2026-01-22',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"paolo@gmail.com","roomId":1,"status":"Checked Out","address":"address","roomName":"Room A","agentName":"","guestName":"Paolo Reyes","downpayment":18250,"phoneNumber":"09191234567","statusAudit":[{"at":"2026-03-23T05:41:37.027Z","to":"Checked Out","from":"Pending Checkout","actor":"owner-ui","actorId":"6","actorName":"account name","actorRole":"owner"}],"totalAmount":18250,"inquirerType":"client","lastActionBy":"account name","paymentMethod":"Pending","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"","stayingGuestPhone":"","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,4,1,false,
  ARRAY['b7c963d4-b0b1-426d-9f86-5e06a630c916'],
  'Paolo Reyes','','','','',
  'paolo@gmail.com','09191234567',
  'Room A','address'
),

-- 103
(
  103,
  10,
  '[1]',
  '2026-01-25',
  '2026-01-29',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"anna@gmail.com","roomId":1,"status":"Checked Out","address":"address","roomName":"Room A","agentName":"","guestName":"Anna Cruz","downpayment":18250,"phoneNumber":"09201234567","statusAudit":[{"at":"2026-03-23T05:41:37.027Z","to":"Checked Out","from":"Pending Checkout","actor":"owner-ui","actorId":"6","actorName":"account name","actorRole":"owner"}],"totalAmount":18250,"inquirerType":"client","lastActionBy":"account name","paymentMethod":"Pending","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"","stayingGuestPhone":"","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,4,1,false,
  ARRAY['b7c963d4-b0b1-426d-9f86-5e06a630c916'],
  'Anna Cruz','','','','',
  'anna@gmail.com','09201234567',
  'Room A','address'
),

-- 104
(
  104,
  10,
  '[1]',
  '2026-01-30',
  '2026-02-01',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"leo@gmail.com","roomId":1,"status":"Checked Out","address":"address","roomName":"Room A","agentName":"","guestName":"Leo Garcia","downpayment":18250,"phoneNumber":"09211234567","statusAudit":[{"at":"2026-03-23T05:41:37.027Z","to":"Checked Out","from":"Pending Checkout","actor":"owner-ui","actorId":"6","actorName":"account name","actorRole":"owner"}],"totalAmount":18250,"inquirerType":"client","lastActionBy":"account name","paymentMethod":"Pending","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"","stayingGuestPhone":"","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,4,1,false,
  ARRAY['b7c963d4-b0b1-426d-9f86-5e06a630c916'],
  'Leo Garcia','','','','',
  'leo@gmail.com','09211234567',
  'Room A','address'
),

-- 105
(
  105,
  10,
  '[1]',
  '2025-10-05',
  '2025-10-06',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"carlosd@gmail.com","roomId":1,"status":"Checked Out","address":"Quezon City","roomName":"Room A","agentName":"Carlos Dela Torre","guestName":"Carlos Dela Torre","downpayment":3000,"phoneNumber":"09170000001","statusAudit":[],"totalAmount":15000,"inquirerType":"agent","lastActionBy":"account name","paymentMethod":"GCash","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"Carlos Dela Torre","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"carlosd@gmail.com","stayingGuestPhone":"09170000001","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,0,1,true,
  ARRAY[]::uuid[],
  'Carlos Dela Torre','Carlos Dela Torre','Carlos Dela Torre','carlosd@gmail.com','09170000001',
  'carlosd@gmail.com','09170000001',
  'Room A','Quezon City'
),

-- 106
(
  106,
  10,
  '[1]',
  '2025-10-20',
  '2025-10-21',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"angelar@gmail.com","roomId":1,"status":"Checked Out","address":"Pasig City","roomName":"Room A","agentName":"Angela Reyes","guestName":"Angela Reyes","downpayment":3000,"phoneNumber":"09170000002","statusAudit":[],"totalAmount":15000,"inquirerType":"agent","lastActionBy":"account name","paymentMethod":"GCash","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"Angela Reyes","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"angelar@gmail.com","stayingGuestPhone":"09170000002","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,0,1,true,
  ARRAY[]::uuid[],
  'Angela Reyes','Angela Reyes','Angela Reyes','angelar@gmail.com','09170000002',
  'angelar@gmail.com','09170000002',
  'Room A','Pasig City'
),

-- 107
(
  107,
  10,
  '[1]',
  '2025-11-03',
  '2025-11-05',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"josephl@gmail.com","roomId":1,"status":"Checked Out","address":"Makati City","roomName":"Room A","agentName":"Joseph Lim","guestName":"Joseph Lim","downpayment":3000,"phoneNumber":"09170000003","statusAudit":[],"totalAmount":15000,"inquirerType":"agent","lastActionBy":"account name","paymentMethod":"GCash","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"Joseph Lim","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"josephl@gmail.com","stayingGuestPhone":"09170000003","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,0,1,true,
  ARRAY[]::uuid[],
  'Joseph Lim','Joseph Lim','Joseph Lim','josephl@gmail.com','09170000003',
  'josephl@gmail.com','09170000003',
  'Room A','Makati City'
),

-- 108
(
  108,
  10,
  '[1]',
  '2025-11-25',
  '2025-11-27',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"marielp@gmail.com","roomId":1,"status":"Checked Out","address":"Taguig City","roomName":"Room A","agentName":"Mariel Perez","guestName":"Mariel Perez","downpayment":3000,"phoneNumber":"09170000004","statusAudit":[],"totalAmount":15000,"inquirerType":"agent","lastActionBy":"account name","paymentMethod":"GCash","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"Mariel Perez","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"marielp@gmail.com","stayingGuestPhone":"09170000004","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,0,1,true,
  ARRAY[]::uuid[],
  'Mariel Perez','Mariel Perez','Mariel Perez','marielp@gmail.com','09170000004',
  'marielp@gmail.com','09170000004',
  'Room A','Taguig City'
),

-- 109
(
  109,
  10,
  '[1]',
  '2025-12-10',
  '2025-12-12',
  '14:00',
  '12:00',
  'Checked Out',
  '{"email":"danielc@gmail.com","roomId":1,"status":"Checked Out","address":"Manila City","roomName":"Room A","agentName":"Daniel Cruz","guestName":"Daniel Cruz","downpayment":3000,"phoneNumber":"09170000005","statusAudit":[],"totalAmount":15000,"inquirerType":"agent","lastActionBy":"account name","paymentMethod":"GCash","lastActionById":"6","lastActionRole":"owner","assignedRoomIds":[1],"paymentProofUrl":null,"paymentVerified":false,"selectedRoomIds":[1],"confirmationStub":null,"paymentProofUrls":[],"stayingGuestName":"Daniel Cruz","assignedRoomNames":["Room A"],"paymentVerifiedAt":null,"stayingGuestEmail":"danielc@gmail.com","stayingGuestPhone":"09170000005","paymentSubmittedAt":null,"pendingDownpayment":0,"pendingPaymentMethod":null,"paymentPendingApproval":false}',
  2,2,4,0,1,true,
  ARRAY[]::uuid[],
  'Daniel Cruz','Daniel Cruz','Daniel Cruz','danielc@gmail.com','09170000005',
  'danielc@gmail.com','09170000005',
  'Room A','Manila City'
);