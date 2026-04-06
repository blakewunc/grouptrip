import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateInviteCode } from '@/lib/utils/invite-code'

const TEMPLATES = {
  pinehurst: {
    title: 'Pinehurst No. 2 & Beyond',
    destination: 'Southern Pines, NC',
    trip_type: 'golf',
    description: '3-night bucket list golf trip: Pinehurst No. 2, The Cradle, and the best of the Sandhills.',
    nights: 3,
    itinerary: [
      // Day 1 — Arrival
      { offset: 0, time: '15:00', title: 'Arrive & Check In', location: 'Pinehurst Resort', description: 'Check into the Carolina Hotel or Holly Inn. Settle in and get your bearings.', sort_order: 0 },
      { offset: 0, time: '16:30', title: 'Warm-Up Round — No. 3 or No. 5', location: 'Pinehurst Resort', description: 'Ease into the Pinehurst greens. More forgiving courses — great warm-up for championship day tomorrow.', sort_order: 1 },
      { offset: 0, time: '18:30', title: 'The Cradle (Par-3 Short Course)', location: 'The Cradle, Pinehurst', description: 'Music, drinks, closest-to-pin games. One of the best experiences in golf right now.', sort_order: 2 },
      { offset: 0, time: '20:00', title: 'Dinner — The Deuce', location: 'The Deuce, Pinehurst Resort', description: 'Overlooks the 18th hole of No. 2. Casual but iconic — perfect first night.', sort_order: 3 },
      // Day 2 — Championship Day
      { offset: 1, time: '08:00', title: 'Pinehurst No. 2 — The Bucket List Round', location: 'Pinehurst No. 2', description: 'Donald Ross design. Turtleback greens punish every miss — caddie highly recommended here.', sort_order: 4 },
      { offset: 1, time: '13:00', title: 'Lunch at the Clubhouse', location: 'Pinehurst Clubhouse', description: 'Refuel at the halfway house or main clubhouse. Relive the morning\'s highlights.', sort_order: 5 },
      { offset: 1, time: '14:30', title: 'Afternoon Round — No. 4 (Optional)', location: 'Pinehurst No. 4', description: 'Slightly more modern feel but still elite quality. Skip if the crew needs a nap.', sort_order: 6 },
      { offset: 1, time: '19:00', title: 'Dinner — Villaggio Ristorante', location: 'Villaggio Ristorante & Bar, Pinehurst', description: 'Best Italian in the area. Great for the nicer group dinner night.', sort_order: 7 },
      { offset: 1, time: '21:00', title: 'Village Bar Hop', location: 'Pinehurst Village', description: 'Drum & Quill Public House → Dugan\'s Pub. Settle the bets from today.', sort_order: 8 },
      // Day 3 — Competitive Day
      { offset: 2, time: '08:00', title: 'Morning Round — Off-Property', location: 'Tobacco Road / Mid Pines / Pine Needles', description: 'Tobacco Road: wild & visually insane. Mid Pines: classic Donald Ross. Pine Needles: championship pedigree. Crew\'s call.', sort_order: 9 },
      { offset: 2, time: '14:00', title: 'Afternoon — Free Time', location: 'Pinehurst', description: 'Replay 9, putting green, or just decompress. Optional drinks at the resort.', sort_order: 10 },
      { offset: 2, time: '18:30', title: 'Final Dinner — Pinehurst Brewing Co.', location: 'Pinehurst Brewing Company', description: 'Great craft beer + casual group vibe. Final night stories and settling bets.', sort_order: 11 },
      // Day 4 — Departure
      { offset: 3, time: '09:00', title: 'Breakfast & Check Out', location: 'Pinehurst Resort', description: 'Casual breakfast. Optional quick 9 or putting green before heading out.', sort_order: 12 },
      { offset: 3, time: '11:00', title: 'Head Out', location: 'Southern Pines, NC', description: 'About 2 hours to Charlotte. Safe travels — already planning the next one.', sort_order: 13 },
    ],
    budget_categories: [
      { name: 'Lodging', split_type: 'equal', description: 'Pinehurst Resort or group house — 3 nights per person', base_per_person: 900 },
      { name: 'Golf — Pinehurst No. 2', split_type: 'equal', description: 'Green fee + caddie (highly recommended)', base_per_person: 500 },
      { name: 'Golf — Additional Rounds', split_type: 'equal', description: 'No. 3/4/5, Tobacco Road, Mid Pines, or Pine Needles', base_per_person: 400 },
      { name: 'Food & Drinks', split_type: 'equal', description: 'Dinners, The Cradle, meals — 3 days', base_per_person: 300 },
      { name: 'Miscellaneous', split_type: 'equal', description: 'Tips, extras, Cradle drinks, souvenirs', base_per_person: 100 },
    ],
  },
} as const

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { template, start_date, end_date, expected_guests } = body

    if (!template || !start_date || !end_date) {
      return NextResponse.json({ error: 'template, start_date, and end_date are required' }, { status: 400 })
    }

    const tmpl = TEMPLATES[template as keyof typeof TEMPLATES]
    if (!tmpl) {
      return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
    }

    const guests = Math.max(1, parseInt(expected_guests) || 4)
    const invite_code = generateInviteCode()
    const totalBudget = tmpl.budget_categories.reduce((sum, cat) => sum + cat.base_per_person, 0) * guests

    // Create trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        title: tmpl.title,
        destination: tmpl.destination,
        trip_type: tmpl.trip_type,
        start_date,
        end_date,
        description: tmpl.description,
        expected_guests: guests,
        budget_total: totalBudget,
        created_by: user.id,
        invite_code,
        status: 'planning',
      })
      .select()
      .single()

    if (tripError || !trip) {
      console.error('Error creating trip:', tripError)
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
    }

    // Seed itinerary items
    const startDate = new Date(start_date + 'T00:00:00')
    const itineraryInserts = tmpl.itinerary.map((item) => {
      const itemDate = new Date(startDate)
      itemDate.setDate(itemDate.getDate() + item.offset)
      return {
        trip_id: trip.id,
        date: itemDate.toISOString().split('T')[0],
        time: item.time,
        title: item.title,
        location: item.location,
        description: item.description,
        sort_order: item.sort_order,
        created_by: user.id,
      }
    })

    const { error: itinError } = await supabase.from('itinerary_items').insert(itineraryInserts)
    if (itinError) console.error('Error seeding itinerary:', itinError)

    // Seed budget categories
    const budgetInserts = tmpl.budget_categories.map((cat, idx) => ({
      trip_id: trip.id,
      name: cat.name,
      split_type: cat.split_type,
      description: cat.description,
      estimated_cost: cat.base_per_person * guests,
      sort_order: idx,
    }))

    const { error: budgetError } = await supabase.from('budget_categories').insert(budgetInserts)
    if (budgetError) console.error('Error seeding budget:', budgetError)

    return NextResponse.json({ trip }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
