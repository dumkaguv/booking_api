import { Prisma } from '@prisma/client'

import { prisma } from '../prisma-client'

type SeedAmenity = Pick<Prisma.AmenityCreateManyInput, 'code' | 'name' | 'color'>

const amenities: SeedAmenity[] = [
  { code: 'WIFI', name: 'Wi-Fi', color: '#2563EB' },
  { code: 'PARKING', name: 'Parking', color: '#16A34A' },
  { code: 'KITCHEN', name: 'Kitchen', color: '#EA580C' },
  { code: 'AIR_CONDITIONING', name: 'Air conditioning', color: '#0EA5E9' },
  { code: 'HEATING', name: 'Heating', color: '#DC2626' },
  { code: 'WASHER', name: 'Washer', color: '#7C3AED' },
  { code: 'DRYER', name: 'Dryer', color: '#9333EA' },
  { code: 'TV', name: 'TV', color: '#0F766E' },
  { code: 'POOL', name: 'Pool', color: '#0891B2' },
  { code: 'GYM', name: 'Gym', color: '#15803D' },
  { code: 'ELEVATOR', name: 'Elevator', color: '#475569' },
  { code: 'PET_FRIENDLY', name: 'Pet friendly', color: '#B45309' },
  { code: 'BALCONY', name: 'Balcony', color: '#65A30D' },
  { code: 'SEA_VIEW', name: 'Sea view', color: '#0284C7' },
  { code: 'MOUNTAIN_VIEW', name: 'Mountain view', color: '#4D7C0F' },
  { code: 'BREAKFAST', name: 'Breakfast included', color: '#CA8A04' },
  { code: 'WORKSPACE', name: 'Dedicated workspace', color: '#4F46E5' },
  { code: 'SELF_CHECK_IN', name: 'Self check-in', color: '#0D9488' },
  { code: 'SMOKE_ALARM', name: 'Smoke alarm', color: '#BE123C' },
  { code: 'FIRST_AID_KIT', name: 'First aid kit', color: '#BE185D' },
  { code: 'HOT_TUB', name: 'Hot tub', color: '#B91C1C' },
  { code: 'BBQ_GRILL', name: 'BBQ grill', color: '#C2410C' },
  { code: 'FIREPLACE', name: 'Fireplace', color: '#9A3412' },
  { code: 'KIDS_FRIENDLY', name: 'Kids friendly', color: '#65A30D' },
  { code: 'BEACH_ACCESS', name: 'Beach access', color: '#0369A1' },
  { code: 'SKI_IN_OUT', name: 'Ski in/out', color: '#1D4ED8' },
  { code: 'EV_CHARGER', name: 'EV charger', color: '#15803D' },
  { code: 'WHEELCHAIR_ACCESS', name: 'Wheelchair access', color: '#334155' },
  { code: 'LUGGAGE_DROP', name: 'Luggage drop-off', color: '#0F766E' },
  { code: 'LATE_CHECKOUT', name: 'Late checkout', color: '#7E22CE' }
]

export const createAmenities = async () => {
  await prisma.amenity.createMany({
    data: amenities,
    skipDuplicates: true
  })
}
