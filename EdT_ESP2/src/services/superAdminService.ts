import api from './api';
import type { CreateSchoolWithAdminDto, SchoolWithAdminDto, CreateEcoleDto } from '../types';

export const superAdminService = {
  createSchool: async (data: CreateSchoolWithAdminDto): Promise<SchoolWithAdminDto> => {
    const response = await api.post('/super-admin/schools', data);
    return response.data;
  },

  listSchools: async (): Promise<SchoolWithAdminDto[]> => {
    const response = await api.get('/super-admin/schools');
    return response.data;
  },

  getSchool: async (id: string): Promise<SchoolWithAdminDto> => {
    const response = await api.get(`/super-admin/schools/${id}`);
    return response.data;
  },

  updateSchool: async (id: string, data: Partial<CreateEcoleDto>): Promise<SchoolWithAdminDto> => {
    const response = await api.put(`/super-admin/schools/${id}`, data);
    return response.data;
  },

  deleteSchool: async (id: string): Promise<void> => {
    await api.delete(`/super-admin/schools/${id}`);
  },
};
