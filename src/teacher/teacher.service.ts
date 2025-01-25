import { Injectable } from '@nestjs/common';
import { CreateNewSubjectDto } from '../dto/createNewSubject.dto';
import { UserRequest } from '../types/extendedExpressRequest';
import { UserService } from '../user/user.service';

@Injectable()
export class TeacherService {
  constructor(private readonly userService: UserService) {}

  async createNewSubject(
    createSubjectDTO: CreateNewSubjectDto,
    req: UserRequest,
  ): Promise<{ success: boolean }> {
    const { subject } = createSubjectDTO;
    const { email } = req.user;

    const existingUser = await this.userService.findByEmail(email, false);

    if (existingUser.subjects) {
      existingUser.subjects = `${existingUser.subjects}, ${subject}`;
    } else {
      existingUser.subjects = subject;
    }

    await this.userService.saveUser(existingUser);

    return { success: true };
  }

  async getSubjects(req: UserRequest): Promise<string[]> {
    const { email } = req.user;

    const existingUser = await this.userService.findByEmail(email, false);
    const subjectsArray = existingUser?.subjects?.split(', ') || [];

    return subjectsArray;
  }

  async deleteSubject(
    req: UserRequest,
    subject: string,
  ): Promise<{ success: boolean }> {
    const { email } = req.user;

    const existingUser = await this.userService.findByEmail(email, false);
    const subjectsArray = existingUser?.subjects?.split(', ') || [];
    const updatedSubjects = subjectsArray.filter((item) => item !== subject);
    const subjectsString = updatedSubjects.join(', ').trim();

    existingUser.subjects = subjectsString === '' ? null : subjectsString;

    await this.userService.saveUser(existingUser);

    return { success: true };
  }
}
