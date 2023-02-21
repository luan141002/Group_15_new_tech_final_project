import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ThesisService from "../services/ThesisService";
import ThesisEditor from "../components/ThesisEditor";

function EditThesisPage() {
  const { tid } = useParams();
  const [thesis, setThesis] = useState(null);

  const onLoad = async () => {
    if (tid) {
      setThesis(await ThesisService.getThesis(tid, { getSubmissions: true }));
    }
  };

  const handleSubmit = async (thesis) => {
    if (tid) {
      
    } else {
      await ThesisService.createThesis(thesis);
    }
  };

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <>
      <ThesisEditor thesis={thesis} onSubmit={handleSubmit} />
    </>
  );
}

export default EditThesisPage;
