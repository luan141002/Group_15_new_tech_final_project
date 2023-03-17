import { useEffect, useState } from 'react';
import ThesisTable from '../components/ThesisTable';
import { useAccount } from '../providers/account';

function ThesesPage() {
  const { account } = useAccount();
  const [all, setAll] = useState(false);

  useEffect(() => {
    setAll(account.kind === 'administrator');
  }, [account]);

  return (
    <>
      <ThesisTable
        all={all}
      />
    </>
  )
}

export default ThesesPage;
