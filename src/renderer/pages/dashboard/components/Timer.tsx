function Timer({ seconds }: { seconds: number }) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // Pad single digit numbers with leading zeros
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return (
    <div className='flex w-full justify-center h-6'>
      <p className='py-0'>{formattedHours}</p>
      <p className='px-1 py-0'>:</p>
      <p className='py-0'>{formattedMinutes}</p>
      <p className='px-1 py-0'>:</p>
      <p className='py-0'>{formattedSeconds}</p>
    </div>
  );
}

export default Timer;
