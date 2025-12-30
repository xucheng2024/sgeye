import HDBNav from '@/components/HDBNav'

export default function HDBLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HDBNav />
      {children}
    </>
  )
}

