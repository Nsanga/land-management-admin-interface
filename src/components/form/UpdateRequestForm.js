import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import {
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const UpdateRequestForm = ({ onClose, fetchRequests, currentItem }) => {
  const [status, setStatus] = useState(currentItem?.status || "pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Appel API pour mettre à jour uniquement le statut
      const res = await fetch(`/api/requests/${currentItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchRequests?.();
        onClose();
      }
    } catch (err) {
      console.error("Erreur update statut", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
    >
      <Card className="w-full max-w-2xl p-6 rounded-2xl shadow-2xl bg-white">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Détails de la Demande</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Infos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Numéro de demande" value={currentItem.requestNumber} />
            <InfoItem label="Type de propriété" value={currentItem.propertyType} />
            <InfoItem label="Localisation" value={currentItem.location} />
            <InfoItem label="Urgence" value={currentItem.urgency} />
          </div>

          <InfoItem label="Description" value={currentItem.description} />

          {/* Infos citoyen */}
          <div className="border-t pt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Citoyen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Nom"
                value={`${currentItem.citizen.firstName} ${currentItem.citizen.lastName}`}
              />
              <InfoItem label="Email" value={currentItem.citizen.email} />
              <InfoItem label="Téléphone" value={currentItem.citizen.phoneNumber} />
              <InfoItem label="NUI" value={currentItem.citizen.NUI} />
            </div>
          </div>

          {/* Statut modifiable */}
          <div className="border-t pt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Statut</h3>
            <FormControl fullWidth className="md:w-1/2">
              <InputLabel id="status-label">Statut</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="completed">Terminée</MenuItem>
                <MenuItem value="rejected">Rejetée</MenuItem>
                <MenuItem value="in_progress">En cours</MenuItem>
              </Select>
            </FormControl>
          </div>
        </CardContent>

        {/* Actions */}
        <div className="flex justify-end mt-6 space-x-3">
          <Button variant="outlined" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Mettre à jour
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-base font-medium text-gray-800">{value || "—"}</span>
  </div>
);

export default UpdateRequestForm;
