import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ThesisService from "../services/ThesisService";
import ThesisView from "../components/ThesisView";

function ThesisPage() {
  const { tid } = useParams();
  const [thesis, setThesis] = useState(null);

  const onLoad = async () => {
    if (tid) {
      setThesis(await ThesisService.getThesis(tid, { getSubmissions: true }));
    }
  };

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <>
      { thesis && <ThesisView thesis={thesis} /> }
    </>
  );
}

export default ThesisPage;
