import Head from 'next/head'
import ProfessionalScratchDemo from '../components/ProfessionalScratchDemo'

export default function Home() {
  return (
    <>
      <Head>
        <title>ScratchStrategy™ - Revolutionary Scratch Card Gaming</title>
        <meta name="description" content="Every card has winning potential. Strategic gameplay meets guaranteed opportunity." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProfessionalScratchDemo />
    </>
  )
}
