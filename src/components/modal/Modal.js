import { useState } from 'react';
import AddParcelForm from '../form/AddParcelForm';
import AddUserForm from '../form/AddUserForm';
import AddTransactionForm from '../form/AddTransactionForm';
import AddPropertyTitleForm from '../form/AddPropertyTitleForm';
import AddReportForm from '../form/AddReportForm';
import UpdateRequestForm from '../form/UpdateRequestForm';

export default function Modal({ isOpen, onClose, modalType, fetchParcels, fetchUsers, fetchTransactions, fetchTitles, fetchReports, fetchRequests, parcels, reports, requests, currentItem }) {
  if (!isOpen) return null;

  const renderForm = () => {
    switch (modalType) {
      case 'parcel':
        return <AddParcelForm fetchParcels={fetchParcels} onClose={onClose} currentItem={currentItem} />;
      case 'user':
        return <AddUserForm fetchUsers={fetchUsers} onClose={onClose} currentItem={currentItem}/>;
      case 'transaction':
        return <AddTransactionForm fetchTransactions={fetchTransactions} parcels={parcels} onClose={onClose} currentItem={currentItem} />;
      case 'title':
        return <AddPropertyTitleForm fetchTitles={fetchTitles} parcels={parcels} onClose={onClose} currentItem={currentItem} />;
      case 'report':
        return <AddReportForm fetchReports={fetchReports} reports={reports} onClose={onClose} currentItem={currentItem} />;
        case 'request':
        return <UpdateRequestForm fetchRequests={fetchRequests} requests={requests} onClose={onClose} currentItem={currentItem} />;
      default:
        return <AddParcelForm fetchParcels={fetchParcels} onClose={onClose} currentItem={currentItem} />;
    }
  };

  const getTitle = () => {
    switch (modalType) {
      case 'parcel':
        return currentItem ? 'Modifier une parcelle' :  'Ajouter une nouvelle parcelle';
      case 'user':
        return currentItem ? 'Modifier un utilisateur' : 'Ajouter un nouvel utilisateur';
      case 'transaction':
        return currentItem ? 'Modifier une transaction' :  'Ajouter une nouvelle transaction';
      case 'title':
        return currentItem ? 'Modifier un titre de propriété' : 'Ajouter un nouveau titre de propriété';
      case 'report':
        return currentItem ? 'Modifier un Rapport de Descente' : 'Création de Rapport de Descente';
      default:
        return 'Ajouter un nouvel élément';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[calc(100vh-50px)] overflow-auto">
        <div className="border-b p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6">
          {renderForm()}
        </div>
      </div>
    </div>
  );
}