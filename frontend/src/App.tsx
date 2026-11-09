import { Route, Routes } from "react-router-dom";
import { AdminPage } from "@/features/admin/AdminPage";
import { AppLayout } from "@/features/layout/AppLayout";
import { HomePage } from "@/features/home/HomePage";
import { ResultsPage } from "@/features/results/ResultsPage";
import { ConfirmationPage } from "@/features/voting/ConfirmationPage";
import { VotePage } from "@/features/voting/VotePage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/resultats" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AppLayout>
  );
}
