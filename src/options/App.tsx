import { useEffect, useState } from "react";
import "./index.css";

import OptionsPage from "./components/HistorySelector.tsx";
import Unlock from "./components/Unlock.tsx";
import {isAppLocked} from "../shared/chromeApi.ts";


function App() {
    const [locked, setLocked] = useState<boolean | null>(null);

    useEffect(() => {
        isAppLocked().then(setLocked);
    }, []);

    if (locked === null) {
        return null; // or loading spinner
    }

    if (locked) {
        return <Unlock onUnlocked={() => setLocked(false)} />;
    }

    return <OptionsPage />;
}

export default App;
