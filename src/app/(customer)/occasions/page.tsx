import type { Metadata } from 'next';
import { OccasionsClientPage } from './occasions-client';

export const metadata: Metadata = { title: 'Shop by Occasion — CelebrateForMe' };

export default function OccasionsPage() {
  return <OccasionsClientPage />;
}
