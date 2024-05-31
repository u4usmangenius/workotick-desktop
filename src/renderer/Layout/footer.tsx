const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className='mt-2 w-full align-baseline'>
      <hr />
      <p className='p-4 text-center text-xs text-gray-500'>
        @{currentYear} Native Brains
      </p>
    </div>
  );
};

export default Footer;
