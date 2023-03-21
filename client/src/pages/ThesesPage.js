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
      <h3>Thesis projects</h3>
      <ThesisTable
        userKind={account.kind}
        filter
        pagination
      />
    </>
  )
}

export default ThesesPage;
