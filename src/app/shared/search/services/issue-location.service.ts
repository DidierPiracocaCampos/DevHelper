import { inject, Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Authenticator } from '../../service/authenticator';
import { ProjectRepository } from '../../../home/service/projects.repository';

@Injectable({ providedIn: 'root' })
export class IssueLocationService {
  private readonly _firestore = inject(Firestore);
  private readonly _auth = inject(Authenticator);
  private readonly _projects = inject(ProjectRepository);

  async findProjectIdByIssue(issueId: string): Promise<string | null> {
    const uid = this._auth.user()?.uid;
    if (!uid) return null;
    const projects = this._projects.allDocs();
    if (projects.length === 0) return null;
    const probes = projects.map(async (p) => {
      if (!p.id) throw new Error('project without id');
      const ref = doc(this._firestore, 'users', uid, 'proyectos', p.id, 'issues', issueId);
      const snap = await getDoc(ref);
      if (snap.exists()) return p.id;
      throw new Error('not in this project');
    });
    try {
      return await Promise.any(probes);
    } catch {
      return null;
    }
  }
}
