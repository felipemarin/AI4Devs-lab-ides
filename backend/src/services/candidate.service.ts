import { PrismaClient } from '@prisma/client';
import { 
  CreateCandidateDto, 
  UpdateCandidateDto, 
  CreateWorkExperienceDto,
  CreateEducationDto,
  CreateLanguageDto 
} from '../types/candidate';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export class CandidateService {
  private formatDate(date: string | Date): Date {
    if (date instanceof Date) {
      return date;
    }
    // Si la fecha no incluye hora, añadimos la hora del día (00:00:00)
    if (!date.includes('T')) {
      return new Date(`${date}T00:00:00.000Z`);
    }
    return new Date(date);
  }

  async create(data: CreateCandidateDto) {
    const { workExperiences, education, skills, languages, ...candidateData } = data;

    // Formatear fechas en workExperiences
    const formattedWorkExperiences = workExperiences?.map(exp => ({
      ...exp,
      startDate: this.formatDate(exp.startDate),
      endDate: exp.endDate ? this.formatDate(exp.endDate) : null
    }));

    // Formatear fechas en education
    const formattedEducation = education?.map(edu => ({
      ...edu,
      startDate: this.formatDate(edu.startDate),
      endDate: edu.endDate ? this.formatDate(edu.endDate) : null
    }));

    return prisma.candidate.create({
      data: {
        ...candidateData,
        birthDate: candidateData.birthDate ? this.formatDate(candidateData.birthDate) : null,
        workExperiences: {
          create: formattedWorkExperiences || [],
        },
        education: {
          create: formattedEducation || [],
        },
        skills: {
          connectOrCreate: (skills || []).map(skill => ({
            where: { name: skill },
            create: { name: skill },
          })),
        },
        languages: {
          connectOrCreate: (languages || []).map(lang => ({
            where: { name: lang.name },
            create: lang,
          })),
        },
      },
      include: {
        workExperiences: true,
        education: true,
        skills: true,
        languages: true,
      },
    });
  }

  async findAll() {
    return prisma.candidate.findMany({
      include: {
        workExperiences: true,
        education: true,
        skills: true,
        languages: true,
      },
    });
  }

  async findById(id: number) {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        workExperiences: true,
        education: true,
        skills: true,
        languages: true,
      },
    });
  }

  async update(id: number, data: UpdateCandidateDto) {
    const { workExperiences, education, skills, languages, ...candidateData } = data;

    // Formatear fechas en workExperiences
    const formattedWorkExperiences = workExperiences?.map(exp => ({
      ...exp,
      startDate: this.formatDate(exp.startDate),
      endDate: exp.endDate ? this.formatDate(exp.endDate) : null
    }));

    // Formatear fechas en education
    const formattedEducation = education?.map(edu => ({
      ...edu,
      startDate: this.formatDate(edu.startDate),
      endDate: edu.endDate ? this.formatDate(edu.endDate) : null
    }));

    return prisma.candidate.update({
      where: { id },
      data: {
        ...candidateData,
        birthDate: candidateData.birthDate ? this.formatDate(candidateData.birthDate) : undefined,
        workExperiences: workExperiences ? {
          deleteMany: {},
          create: formattedWorkExperiences,
        } : undefined,
        education: education ? {
          deleteMany: {},
          create: formattedEducation,
        } : undefined,
        skills: skills ? {
          set: [],
          connectOrCreate: skills.map(skill => ({
            where: { name: skill },
            create: { name: skill },
          })),
        } : undefined,
        languages: languages ? {
          set: [],
          connectOrCreate: languages.map(lang => ({
            where: { name: lang.name },
            create: lang,
          })),
        } : undefined,
      },
      include: {
        workExperiences: true,
        education: true,
        skills: true,
        languages: true,
      },
    });
  }

  async delete(id: number) {
    // Primero eliminamos todos los registros relacionados
    await prisma.$transaction([
      // Eliminar experiencias laborales
      prisma.workExperience.deleteMany({
        where: { candidateId: id }
      }),
      // Eliminar educación
      prisma.education.deleteMany({
        where: { candidateId: id }
      }),
      // Desconectar skills y languages (no los eliminamos, solo la relación)
      prisma.candidate.update({
        where: { id },
        data: {
          skills: { set: [] },
          languages: { set: [] }
        }
      })
    ]);

    // Finalmente eliminamos el candidato
    return prisma.candidate.delete({
      where: { id }
    });
  }

  async addWorkExperience(candidateId: number, workExperience: CreateWorkExperienceDto) {
    const formattedWorkExperience = {
      ...workExperience,
      startDate: this.formatDate(workExperience.startDate),
      endDate: workExperience.endDate ? this.formatDate(workExperience.endDate) : null
    };

    return prisma.workExperience.create({
      data: {
        ...formattedWorkExperience,
        candidateId
      }
    });
  }

  async addEducation(candidateId: number, education: CreateEducationDto) {
    const formattedEducation = {
      ...education,
      startDate: this.formatDate(education.startDate),
      endDate: education.endDate ? this.formatDate(education.endDate) : null
    };

    return prisma.education.create({
      data: {
        ...formattedEducation,
        candidateId
      }
    });
  }

  async addSkill(candidateId: number, skillName: string) {
    return prisma.candidate.update({
      where: { id: candidateId },
      data: {
        skills: {
          connectOrCreate: {
            where: { name: skillName },
            create: { name: skillName }
          }
        }
      }
    });
  }

  async addLanguage(candidateId: number, language: CreateLanguageDto) {
    return prisma.candidate.update({
      where: { id: candidateId },
      data: {
        languages: {
          connectOrCreate: {
            where: { name: language.name },
            create: language
          }
        }
      }
    });
  }

  async updateWorkExperience(candidateId: number, experienceId: number, workExperience: CreateWorkExperienceDto) {
    const formattedWorkExperience = {
      ...workExperience,
      startDate: this.formatDate(workExperience.startDate),
      endDate: workExperience.endDate ? this.formatDate(workExperience.endDate) : null
    };

    return prisma.workExperience.update({
      where: { id: experienceId },
      data: formattedWorkExperience
    });
  }

  async deleteWorkExperience(candidateId: number, experienceId: number) {
    return prisma.workExperience.delete({
      where: { id: experienceId }
    });
  }

  async updateEducation(candidateId: number, educationId: number, education: CreateEducationDto) {
    const formattedEducation = {
      ...education,
      startDate: this.formatDate(education.startDate),
      endDate: education.endDate ? this.formatDate(education.endDate) : null
    };

    return prisma.education.update({
      where: { id: educationId },
      data: formattedEducation
    });
  }

  async updateSkill(candidateId: number, oldSkillName: string, newSkillName: string) {
    // Primero desconectamos la habilidad antigua
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        skills: {
          disconnect: { name: oldSkillName }
        }
      }
    });

    // Luego conectamos o creamos la nueva habilidad
    return prisma.candidate.update({
      where: { id: candidateId },
      data: {
        skills: {
          connectOrCreate: {
            where: { name: newSkillName },
            create: { name: newSkillName }
          }
        }
      }
    });
  }

  async updateLanguage(candidateId: number, languageId: number, language: CreateLanguageDto) {
    return prisma.language.update({
      where: { id: languageId },
      data: language
    });
  }

  async deleteEducation(candidateId: number, educationId: number) {
    return prisma.education.delete({
      where: { id: educationId }
    });
  }

  async deleteSkill(candidateId: number, skillName: string) {
    return prisma.candidate.update({
      where: { id: candidateId },
      data: {
        skills: {
          disconnect: { name: skillName }
        }
      }
    });
  }

  async deleteLanguage(candidateId: number, languageId: number) {
    return prisma.language.delete({
      where: { id: languageId }
    });
  }

  async createCandidate(data: CreateCandidateDto) {
    return prisma.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate ? this.formatDate(data.birthDate) : null,
        location: data.location,
        resumeUrl: data.resumeUrl,
        notes: data.notes,
        status: data.status,
      },
    });
  }

  async updateCandidate(id: number, data: UpdateCandidateDto) {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Si hay un nuevo archivo y existe uno anterior, eliminar el anterior
    if (data.resumeUrl && candidate.resumeUrl) {
      const oldFilePath = path.join(__dirname, '../../', candidate.resumeUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    return prisma.candidate.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate ? this.formatDate(data.birthDate) : null,
        location: data.location,
        resumeUrl: data.resumeUrl,
        notes: data.notes,
        status: data.status,
      },
    });
  }

  async getAllCandidates() {
    return prisma.candidate.findMany({
      include: {
        workExperiences: true,
        education: true,
        skills: true,
        languages: true,
      },
    });
  }

  async getCandidateById(id: number) {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        workExperiences: true,
        education: true,
        skills: true,
        languages: true,
      },
    });
  }

  async deleteCandidate(id: number) {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Eliminar el archivo de la hoja de vida si existe
    if (candidate.resumeUrl) {
      const filePath = path.join(__dirname, '../../', candidate.resumeUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return prisma.candidate.delete({
      where: { id },
    });
  }

  async getInstitutionSuggestions(query: string) {
    return prisma.education.findMany({
      where: {
        institution: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        institution: true
      },
      distinct: ['institution'],
      take: 10
    });
  }

  async getDegreeSuggestions(query: string) {
    return prisma.education.findMany({
      where: {
        degree: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        degree: true
      },
      distinct: ['degree'],
      take: 10
    });
  }

  async getFieldSuggestions(query: string) {
    return prisma.education.findMany({
      where: {
        field: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        field: true
      },
      distinct: ['field'],
      take: 10
    });
  }

  async getCompanySuggestions(query: string) {
    return prisma.workExperience.findMany({
      where: {
        company: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        company: true
      },
      distinct: ['company'],
      take: 10
    });
  }

  async getPositionSuggestions(query: string) {
    return prisma.workExperience.findMany({
      where: {
        position: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        position: true
      },
      distinct: ['position'],
      take: 10
    });
  }

  async getSkillSuggestions(query: string): Promise<string[]> {
    const skills = await prisma.skill.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        name: true
      },
      distinct: ['name'],
      take: 10
    });
    return skills.map(skill => skill.name);
  }
} 