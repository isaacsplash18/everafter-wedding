/**
 * Everafter — seed data.
 *
 * No backend: this seed IS the demo. Alex (Alex Tan) & Sam (Sam
 * Lim), Saturday 12 June 2027, AYANA Estate, Jimbaran, Bali.
 *
 * Imagery: the couple photos are removed in this portfolio copy; Alt text describes the actual frame — nothing claims a
 * place that cannot be seen in the picture. The handful of remaining stock
 * shots are scenery and faceless detail only, and their captions never imply
 * the wedding has already happened (it is June 2027) or that a stranger in a
 * white dress is Sam.
 */

import type {
  CustomQuestion,
  Guest,
  MealOption,
  Party,
  PartyRsvp,
  ReminderRule,
  WeddingConfig,
  WeddingEvent,
} from './types'

/* -------------------------------------------------------------------------- */
/* Config                                                                      */
/* -------------------------------------------------------------------------- */

export const seedConfig: WeddingConfig = {
  coupleNames: ['Alex', 'Sam'],
  tagline: 'Two families, one cliff-top vow, and a Bali sky full of candlelight.',
  dateISO: '2027-06-12',
  city: 'Jimbaran, Bali',
  rsvpDeadlineISO: '2027-05-01',
  strictNameMatching: true,
  heroPhotoUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1600&q=80',
  contactEmail: 'alexandsam@everafter.love',
  timeZone: 'Asia/Makassar',
  hashtag: '#AlexAndSam',
}

/* -------------------------------------------------------------------------- */
/* Events                                                                      */
/* -------------------------------------------------------------------------- */

export const EVT_WELCOME = 'evt-welcome'
export const EVT_CEREMONY = 'evt-ceremony'
export const EVT_RECEPTION = 'evt-reception'
export const EVT_BRUNCH = 'evt-brunch'

/** Everything except the Sunday brunch. */
const CORE = [EVT_WELCOME, EVT_CEREMONY, EVT_RECEPTION]
/** The full weekend, brunch included. */
const ALL = [EVT_WELCOME, EVT_CEREMONY, EVT_RECEPTION, EVT_BRUNCH]

export const seedEvents: WeddingEvent[] = [
  {
    id: EVT_WELCOME,
    name: 'Welcome Dinner',
    dateISO: '2027-06-11',
    startTime: '18:00',
    endTime: '21:00',
    venue: 'Muaya Beach, Jimbaran',
    address: 'Muaya Beach, Jl. Four Seasons, Jimbaran, Bali 80361, Indonesia',
    description:
      'Come find us on the sand as the sun drops into the bay. Grilled seafood straight off the coals, cold drinks, bare feet — the whole point is to say hello properly before Saturday.',
    dressCode: 'Tropical smart casual. Sandals welcome; the sand does not care about heels.',
    requiresRsvp: true,
    visibleToTags: 'all',
  },
  {
    id: EVT_CEREMONY,
    name: 'Ceremony',
    dateISO: '2027-06-12',
    startTime: '16:00',
    endTime: '16:45',
    venue: 'Tresna Chapel, AYANA Estate',
    address: 'Jl. Karang Mas Sejahtera, Jimbaran, Bali 80361, Indonesia',
    description:
      'We will be married in the glass chapel above the cliffs at four o’clock, with the whole of Jimbaran Bay behind us. Please arrive by half past three — clearing the estate gate takes a few extra minutes.',
    dressCode: 'Tropical formal.',
    requiresRsvp: true,
    visibleToTags: 'all',
  },
  {
    id: EVT_RECEPTION,
    name: 'Reception',
    dateISO: '2027-06-12',
    startTime: '18:00',
    endTime: '23:30',
    venue: 'the SKY at AYANA',
    address: 'Jl. Karang Mas Sejahtera, Jimbaran, Bali 80361, Indonesia',
    description:
      'Dinner on the cliff-edge under the stars, toasts we have been warned about, and dancing until the tide comes in. Late-night bites at eleven.',
    dressCode: 'Tropical formal.',
    requiresRsvp: true,
    visibleToTags: 'all',
    hasMeal: true,
  },
  {
    id: EVT_BRUNCH,
    name: 'Farewell Brunch',
    dateISO: '2027-06-13',
    startTime: '10:00',
    endTime: '13:00',
    venue: 'Kubu, AYANA Estate',
    address: 'Jl. Karang Mas Sejahtera, Jimbaran, Bali 80361, Indonesia',
    description:
      'Nasi goreng, pastries, and a very slow goodbye by the water. Come in whatever you woke up in — we mean it.',
    dressCode: 'However you feel.',
    requiresRsvp: true,
    visibleToTags: ['family', 'wedding-party'],
  },
]

/* -------------------------------------------------------------------------- */
/* Meals                                                                       */
/* -------------------------------------------------------------------------- */

export const MEAL_CHICKEN = 'meal-chicken'
export const MEAL_SALMON = 'meal-salmon'
export const MEAL_RISOTTO = 'meal-risotto'

export const seedMeals: MealOption[] = [
  {
    id: MEAL_CHICKEN,
    name: 'Herb-Roasted Chicken',
    description: 'Lemon, thyme and garlic, with buttered new potatoes and spring greens.',
  },
  {
    id: MEAL_SALMON,
    name: 'Pan-Seared Salmon',
    description: 'Line-caught salmon, brown butter, farro and charred asparagus.',
  },
  {
    id: MEAL_RISOTTO,
    name: 'Wild Mushroom Risotto',
    description: 'Carnaroli rice, local chanterelles, aged pecorino and chive oil.',
    vegetarian: true,
  },
]

/* -------------------------------------------------------------------------- */
/* Custom questions                                                            */
/* -------------------------------------------------------------------------- */

export const Q_SONG = 'q-song'
export const Q_SHUTTLE = 'q-shuttle'
export const Q_REHEARSAL = 'q-rehearsal'

export const seedQuestions: CustomQuestion[] = [
  {
    id: Q_SONG,
    type: 'text',
    prompt: 'Is there a song that will get you onto the dance floor?',
    perGuest: false,
  },
  {
    id: Q_SHUTTLE,
    type: 'multiple',
    prompt: 'Would you like seats on the shuttle between the Jimbaran hotels and AYANA?',
    options: [
      'Yes, both ways',
      'Yes, hotel to venue only',
      'Yes, venue back to hotel only',
      'No thank you, we have a car',
    ],
    perGuest: false,
    targetTags: ['out-of-town'],
  },
  {
    id: Q_REHEARSAL,
    type: 'multiple',
    prompt: 'Can you join the rehearsal walk-through on Friday at 3:00 pm?',
    options: [
      'Yes, I will be there',
      'No, I will meet everyone at welcome drinks',
      'Not sure yet',
    ],
    perGuest: true,
    targetTags: ['wedding-party'],
  },
]

/* -------------------------------------------------------------------------- */
/* Parties & guests                                                            */
/* -------------------------------------------------------------------------- */

export const seedParties: Party[] = [
  { id: 'party-okafor-parents', label: 'Chidi & Ngozi Okafor', guestIds: ['g-chidi', 'g-ngozi'], plusOneAllowance: 0 },
  { id: 'party-whitfield-parents', label: 'Robert & Eleanor Whitfield', guestIds: ['g-robert', 'g-eleanor'], plusOneAllowance: 0 },
  { id: 'party-adaeze', label: 'Adaeze Okafor', guestIds: ['g-adaeze'], plusOneAllowance: 1 },
  { id: 'party-marcus', label: 'Marcus Whitfield & Tasha Boyd', guestIds: ['g-marcus', 'g-tasha'], plusOneAllowance: 0 },
  { id: 'party-chen', label: 'The Chen Family', guestIds: ['g-david', 'g-mei', 'g-lucas', 'g-sophie'], plusOneAllowance: 0 },
  { id: 'party-sharma', label: 'Priya Sharma', guestIds: ['g-priya'], plusOneAllowance: 1 },
  { id: 'party-bellamy', label: 'Nathaniel & Grace Bellamy', guestIds: ['g-nathaniel', 'g-grace'], plusOneAllowance: 0 },
  { id: 'party-hollis', label: 'Jordan Hollis', guestIds: ['g-jordan', 'g-simone'], plusOneAllowance: 1 },
  { id: 'party-alvarez', label: 'Camila Alvarez & Diego Rivas', guestIds: ['g-camila', 'g-diego'], plusOneAllowance: 0 },
  { id: 'party-thornton', label: 'Margaret Thornton', guestIds: ['g-margaret'], plusOneAllowance: 0 },
  { id: 'party-donnelly', label: 'The Donnelly Family', guestIds: ['g-sean', 'g-maeve', 'g-rory'], plusOneAllowance: 0 },
  { id: 'party-osei', label: 'Kwame & Abena Osei', guestIds: ['g-kwame', 'g-abena'], plusOneAllowance: 0 },
  { id: 'party-lindqvist', label: 'Freya Lindqvist', guestIds: ['g-freya'], plusOneAllowance: 1 },
]

export const seedGuests: Guest[] = [
  /* --- the couple's parents ---------------------------------------------- */
  {
    id: 'g-chidi',
    partyId: 'party-okafor-parents',
    firstName: 'Chidi',
    lastName: 'Okafor',
    email: 'chidi.okafor@example.com',
    invitedEventIds: ALL,
    tags: ['family'],
  },
  {
    id: 'g-ngozi',
    partyId: 'party-okafor-parents',
    firstName: 'Ngozi',
    lastName: 'Okafor',
    email: 'ngozi.okafor@example.com',
    invitedEventIds: ALL,
    tags: ['family'],
  },
  {
    id: 'g-robert',
    partyId: 'party-whitfield-parents',
    firstName: 'Robert',
    lastName: 'Whitfield',
    email: 'robert.whitfield@example.com',
    invitedEventIds: ALL,
    tags: ['family'],
  },
  {
    id: 'g-eleanor',
    partyId: 'party-whitfield-parents',
    firstName: 'Eleanor',
    lastName: 'Whitfield',
    email: 'eleanor.whitfield@example.com',
    invitedEventIds: ALL,
    tags: ['family'],
  },

  /* --- siblings / wedding party ------------------------------------------ */
  {
    id: 'g-adaeze',
    partyId: 'party-adaeze',
    firstName: 'Adaeze',
    lastName: 'Okafor',
    email: 'adaeze.okafor@example.com',
    invitedEventIds: ALL,
    tags: ['family', 'wedding-party'],
  },
  {
    id: 'g-marcus',
    partyId: 'party-marcus',
    firstName: 'Marcus',
    lastName: 'Whitfield',
    email: 'marcus.whitfield@example.com',
    invitedEventIds: ALL,
    tags: ['family', 'wedding-party'],
  },
  {
    id: 'g-tasha',
    partyId: 'party-marcus',
    firstName: 'Tasha',
    lastName: 'Boyd',
    email: 'tasha.boyd@example.com',
    invitedEventIds: ALL,
    tags: ['family'],
  },

  /* --- a family of four, two of them small -------------------------------- */
  {
    id: 'g-david',
    partyId: 'party-chen',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@example.com',
    invitedEventIds: ALL,
    tags: ['family', 'out-of-town'],
  },
  {
    id: 'g-mei',
    partyId: 'party-chen',
    firstName: 'Mei',
    lastName: 'Chen',
    email: 'mei.chen@example.com',
    invitedEventIds: ALL,
    tags: ['family', 'out-of-town'],
  },
  {
    id: 'g-lucas',
    partyId: 'party-chen',
    firstName: 'Lucas',
    lastName: 'Chen',
    isChild: true,
    invitedEventIds: ALL,
    tags: ['family', 'out-of-town'],
  },
  {
    id: 'g-sophie',
    partyId: 'party-chen',
    firstName: 'Sophie',
    lastName: 'Chen',
    isChild: true,
    invitedEventIds: ALL,
    tags: ['family', 'out-of-town'],
  },

  /* --- friends ------------------------------------------------------------ */
  {
    id: 'g-priya',
    partyId: 'party-sharma',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    invitedEventIds: CORE,
    tags: ['friends', 'out-of-town'],
  },
  {
    id: 'g-nathaniel',
    partyId: 'party-bellamy',
    firstName: 'Nathaniel',
    lastName: 'Bellamy',
    email: 'nathaniel.bellamy@example.com',
    invitedEventIds: CORE,
    tags: ['friends', 'out-of-town'],
  },
  {
    id: 'g-grace',
    partyId: 'party-bellamy',
    firstName: 'Grace',
    lastName: 'Bellamy',
    email: 'grace.bellamy@example.com',
    invitedEventIds: CORE,
    tags: ['friends', 'out-of-town'],
  },
  {
    id: 'g-jordan',
    partyId: 'party-hollis',
    firstName: 'Jordan',
    lastName: 'Hollis',
    email: 'jordan.hollis@example.com',
    invitedEventIds: ALL,
    tags: ['friends', 'wedding-party'],
  },
  {
    id: 'g-simone',
    partyId: 'party-hollis',
    firstName: 'Simone',
    lastName: 'Okonkwo',
    isPlusOne: true,
    invitedEventIds: ALL,
    tags: ['friends', 'wedding-party'],
  },
  {
    id: 'g-camila',
    partyId: 'party-alvarez',
    firstName: 'Camila',
    lastName: 'Alvarez',
    email: 'camila.alvarez@example.com',
    invitedEventIds: CORE,
    tags: ['friends'],
  },
  {
    id: 'g-diego',
    partyId: 'party-alvarez',
    firstName: 'Diego',
    lastName: 'Rivas',
    email: 'diego.rivas@example.com',
    invitedEventIds: CORE,
    tags: ['friends'],
  },
  {
    id: 'g-margaret',
    partyId: 'party-thornton',
    firstName: 'Margaret',
    lastName: 'Thornton',
    email: 'margaret.thornton@example.com',
    invitedEventIds: ALL,
    tags: ['family'],
  },
  {
    id: 'g-sean',
    partyId: 'party-donnelly',
    firstName: 'Sean',
    lastName: 'Donnelly',
    email: 'sean.donnelly@example.com',
    invitedEventIds: CORE,
    tags: ['friends'],
  },
  {
    id: 'g-maeve',
    partyId: 'party-donnelly',
    firstName: 'Maeve',
    lastName: 'Donnelly',
    email: 'maeve.donnelly@example.com',
    invitedEventIds: CORE,
    tags: ['friends'],
  },
  {
    id: 'g-rory',
    partyId: 'party-donnelly',
    firstName: 'Rory',
    lastName: 'Donnelly',
    isChild: true,
    invitedEventIds: CORE,
    tags: ['friends'],
  },
  {
    id: 'g-kwame',
    partyId: 'party-osei',
    firstName: 'Kwame',
    lastName: 'Osei',
    email: 'kwame.osei@example.com',
    invitedEventIds: CORE,
    tags: ['friends', 'out-of-town'],
  },
  {
    id: 'g-abena',
    partyId: 'party-osei',
    firstName: 'Abena',
    lastName: 'Osei',
    email: 'abena.osei@example.com',
    invitedEventIds: CORE,
    tags: ['friends', 'out-of-town'],
  },
  {
    id: 'g-freya',
    partyId: 'party-lindqvist',
    firstName: 'Freya',
    lastName: 'Lindqvist',
    email: 'freya.lindqvist@example.com',
    invitedEventIds: CORE,
    tags: ['friends', 'out-of-town'],
  },
]

/* -------------------------------------------------------------------------- */
/* Replies already in hand                                                     */
/* -------------------------------------------------------------------------- */

const yes = (guestId: string, eventIds: string[]) =>
  eventIds.map((eventId) => ({ guestId, eventId, attending: true }))

const no = (guestId: string, eventIds: string[]) =>
  eventIds.map((eventId) => ({ guestId, eventId, attending: false }))

export const seedRsvps: PartyRsvp[] = [
  {
    partyId: 'party-okafor-parents',
    submittedAt: '2027-01-18T14:05:00.000Z',
    attendance: [...yes('g-chidi', ALL), ...yes('g-ngozi', ALL)],
    meals: [
      { guestId: 'g-chidi', mealId: MEAL_CHICKEN, dietaryNotes: '' },
      { guestId: 'g-ngozi', mealId: MEAL_SALMON, dietaryNotes: 'No shellfish in anything, please.' },
    ],
    custom: [{ questionId: Q_SONG, value: 'Sweet Mother — Prince Nico Mbarga. Non-negotiable.' }],
    noteToCouple: 'We have waited a long time for this weekend. Tell us what to carry.',
  },
  {
    partyId: 'party-whitfield-parents',
    submittedAt: '2027-01-22T20:40:00.000Z',
    attendance: [...yes('g-robert', ALL), ...yes('g-eleanor', ALL)],
    meals: [
      { guestId: 'g-robert', mealId: MEAL_CHICKEN, dietaryNotes: '' },
      { guestId: 'g-eleanor', mealId: MEAL_RISOTTO, dietaryNotes: 'Vegetarian.' },
    ],
    custom: [{ questionId: Q_SONG, value: 'Ain’t No Mountain High Enough' }],
  },
  {
    partyId: 'party-chen',
    submittedAt: '2027-02-03T02:11:00.000Z',
    attendance: [
      ...yes('g-david', ALL),
      ...yes('g-mei', ALL),
      ...yes('g-lucas', CORE),
      ...no('g-lucas', [EVT_BRUNCH]),
      ...yes('g-sophie', CORE),
      ...no('g-sophie', [EVT_BRUNCH]),
    ],
    meals: [
      { guestId: 'g-david', mealId: MEAL_CHICKEN, dietaryNotes: '' },
      { guestId: 'g-mei', mealId: MEAL_SALMON, dietaryNotes: '' },
      { guestId: 'g-lucas', mealId: MEAL_RISOTTO, dietaryNotes: 'No mushrooms if that is possible — he will eat the rice.' },
      {
        guestId: 'g-sophie',
        mealId: MEAL_RISOTTO,
        dietaryNotes: 'Severe peanut allergy. Nothing cooked in peanut oil, and please flag the kitchen.',
      },
    ],
    custom: [
      { questionId: Q_SONG, value: 'September — Earth, Wind & Fire' },
      { questionId: Q_SHUTTLE, value: 'Yes, both ways' },
    ],
    noteToCouple: 'The children have been practising their dancing for a month. You have been warned.',
  },
  {
    partyId: 'party-bellamy',
    submittedAt: '2027-02-19T17:32:00.000Z',
    attendance: [...yes('g-nathaniel', CORE), ...no('g-grace', CORE)],
    meals: [{ guestId: 'g-nathaniel', mealId: MEAL_SALMON, dietaryNotes: '' }],
    custom: [
      { questionId: Q_SONG, value: 'Tainted Love' },
      { questionId: Q_SHUTTLE, value: 'Yes, hotel to venue only' },
    ],
    noteToCouple:
      'Grace is due at the end of May and her doctor has drawn a line on the map. She sends every ounce of her love.',
  },
  {
    partyId: 'party-hollis',
    submittedAt: '2027-02-27T23:58:00.000Z',
    attendance: [...yes('g-jordan', ALL), ...yes('g-simone', ALL)],
    meals: [
      { guestId: 'g-jordan', mealId: MEAL_CHICKEN, dietaryNotes: '' },
      { guestId: 'g-simone', mealId: MEAL_SALMON, dietaryNotes: 'Gluten free, please.' },
    ],
    custom: [
      { questionId: Q_SONG, value: 'Before I Let Go — Frankie Beverly & Maze' },
      { questionId: Q_REHEARSAL, guestId: 'g-jordan', value: 'Yes, I will be there' },
      { questionId: Q_REHEARSAL, guestId: 'g-simone', value: 'No, I will meet everyone at welcome drinks' },
    ],
  },
  {
    partyId: 'party-alvarez',
    submittedAt: '2027-03-06T15:14:00.000Z',
    attendance: [...yes('g-camila', CORE), ...yes('g-diego', CORE)],
    meals: [
      {
        guestId: 'g-camila',
        mealId: MEAL_RISOTTO,
        dietaryNotes: 'Vegetarian, and dairy is rough on me — no cream if the kitchen can manage it.',
      },
      { guestId: 'g-diego', mealId: MEAL_CHICKEN, dietaryNotes: '' },
    ],
    custom: [{ questionId: Q_SONG, value: 'La Vida Es Un Carnaval — Celia Cruz' }],
  },
  {
    partyId: 'party-thornton',
    submittedAt: '2027-03-11T13:02:00.000Z',
    attendance: [...no('g-margaret', ALL)],
    meals: [],
    custom: [],
    noteToCouple:
      'My travelling days are behind me, my darlings, but I will be watching the clock all day on the twelfth. Send photographs.',
  },
  {
    partyId: 'party-lindqvist',
    submittedAt: '2027-03-24T09:47:00.000Z',
    attendance: [...yes('g-freya', CORE)],
    meals: [{ guestId: 'g-freya', mealId: MEAL_CHICKEN, dietaryNotes: '' }],
    custom: [
      { questionId: Q_SONG, value: 'Dancing On My Own — Robyn' },
      { questionId: Q_SHUTTLE, value: 'Yes, both ways' },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* Reminder drip (demo UI — nothing is ever actually sent)                     */
/* -------------------------------------------------------------------------- */

export const seedReminders: ReminderRule[] = [
  { id: 'rem-45', offsetDaysBeforeDeadline: 45, channel: 'email', audience: 'pending', enabled: true },
  { id: 'rem-21', offsetDaysBeforeDeadline: 21, channel: 'email', audience: 'pending', enabled: true },
  { id: 'rem-7', offsetDaysBeforeDeadline: 7, channel: 'text', audience: 'pending', enabled: true },
  { id: 'rem-2', offsetDaysBeforeDeadline: 2, channel: 'text', audience: 'pending', enabled: false },
  { id: 'rem-0', offsetDaysBeforeDeadline: 0, channel: 'email', audience: 'all', enabled: false },
]

/* -------------------------------------------------------------------------- */
/* Guest photo wall                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Not in the original spec's model, but the Photos page lets guests add to the
 * wall, which needs somewhere to live. Kept deliberately small.
 */
export interface GuestPhoto {
  id: string
  url: string
  alt: string
  caption: string
  credit: string
  likes: number
  /** True for photos a visitor added during this demo session. */
  userAdded?: boolean
}

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`


/**
 * The wall leads with the real photographs and ends with three faceless
 * texture shots. The wedding is still in the future, so nothing here is
 * captioned as a memory of the weekend itself.
 */
export const seedPhotos: GuestPhoto[] = [

  /* --- texture: scenery and faceless detail, never passed off as them ----- */
  {
    id: 'photo-gate',
    url: unsplash('photo-1537953773345-d172ccf13cf1'),
    alt: 'A tall Balinese split gateway mirrored in still water under a grey, clouded sky.',
    caption: 'The island, waiting for us.',
    credit: 'Kwame Osei',
    likes: 26,
  },
  {
    id: 'photo-signage',
    url: unsplash('photo-1507504031003-b417219a0fde'),
    alt: 'A carved wooden “Mr & Mrs” sign hanging from a timber frame against a bright sky and leaves.',
    caption: 'Pinned to the planning board since the day we booked.',
    credit: 'Sam',
    likes: 31,
  },
  {
    id: 'photo-empty-room',
    url: unsplash('photo-1519741497674-611481863552'),
    alt: 'An empty reception hall the morning before a wedding — draped fabric, chandeliers, and round tables not yet laid.',
    caption: 'What a room looks like the morning before. Ours will have more sea.',
    credit: 'Adaeze Okafor',
    likes: 22,
  },
]
