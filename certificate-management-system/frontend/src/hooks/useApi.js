import { useAuth } from '../context/AuthContext';
import { certificatesAPI } from '../services/api';

export const useCertificates = () => {
  const { user } = useAuth();

  const uploadCertificate = async (formData) => {
    return certificatesAPI.upload(formData);
  };

  const getStats = () => certificatesAPI.getStats();
  const getMyCertificates = () => certificatesAPI.getMine();
  const getAllCertificates = () => certificatesAPI.getAdminAll();
  const approve = (id) => certificatesAPI.approve(id);
  const reject = (id) => certificatesAPI.reject(id);

  return {
    uploadCertificate,
    getStats,
    getMyCertificates,
    getAllCertificates,
    approve,
    reject,
    isAdmin: user?.role === 'admin'
  };
};
