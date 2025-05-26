import { useEffect } from "react";
import RemindersView from "@/components/reminders/RemindersView";

const Reminders = () => {
  useEffect(() => {
    document.title = "Lembretes | Zencora Noma";
  }, []);

  return <RemindersView />;
};

export default Reminders;
