import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import {UpdateLifecycle} from './AppUpdate';

createRoot(document.getElementById("root")).render(<><UpdateLifecycle/><App /></>);
