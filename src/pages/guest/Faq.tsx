/**
 * Everafter — FAQ.
 *
 * An accessible accordion: real buttons, real `aria-expanded`, panel height
 * animated by GSAP (see `FaqItem`), single item open at a time.
 */
import { useState } from 'react'

import FaqItem from '../../components/guest/FaqItem'
import { useWeddingStore } from '../../lib/store'
import '../../styles/guest-faq.css'

export default function Faq() {
  const config = useWeddingStore((s) => s.config)
  const [openId, setOpenId] = useState<string | null>('dress-code')

  const items: { id: string; question: string; answer: string }[] = [
    {
      id: 'dress-code',
      question: 'What should I wear?',
      answer:
        'Tropical formal for the ceremony and reception on Saturday — think a linen suit or a floor-length or cocktail dress, and shoes that can handle stone paths. Friday’s welcome dinner is tropical smart casual and barefoot-on-the-sand friendly. Sunday brunch is however you feel when you wake up. We mean it.',
    },
    {
      id: 'kids',
      question: 'Are children welcome?',
      answer:
        'At most events, yes — this wedding is a family one. Your invitation (found on the RSVP page) lists exactly which events include your kids, since a couple of moments on the weekend are adults-only. If you are ever unsure, write to us and we will tell you plainly.',
    },
    {
      id: 'parking',
      question: 'Where do we park?',
      answer:
        'Complimentary valet at AYANA Estate for every event — just follow the drive up from the main gate. An attendant will be directing cars from Friday evening through Sunday morning.',
    },
    {
      id: 'hashtag',
      question: 'Is there a wedding hashtag?',
      answer: `There is: ${config.hashtag}. Tag whatever you catch on your phone and we promise to read every one of them — probably more than once.`,
    },
    {
      id: 'shuttle',
      question: 'Is there a shuttle from the hotels?',
      answer:
        'Yes, running between the Jimbaran hotels and AYANA on Friday and Saturday. Let us know you would like a seat when you RSVP — there is a question just for it if you are staying out of town.',
    },
    {
      id: 'weather',
      question: 'What does the weather usually do in June?',
      answer:
        'Warm and dry — June sits squarely in Bali’s dry season, with days in the high 20s to low 30s (Celsius) and a light breeze off the bay in the evenings. The ceremony and reception both use the outdoors, with a covered plan ready in case a passing shower has other ideas.',
    },
  ]

  return (
    <div className="faq-page">
      <h1>Questions, answered before you ask</h1>
      <p>The things people always want to know, in one place.</p>

      <div className="faq-list">
        {items.map((item) => (
          <FaqItem
            key={item.id}
            question={item.question}
            answer={item.answer}
            open={openId === item.id}
            onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
          />
        ))}
      </div>
    </div>
  )
}
