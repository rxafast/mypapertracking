import { createClient } from '@supabase/supabase-js';
import { AppSettings, ClassRecord, ExaminationPaper, StatusHistoryEntry } from '../types';
import { StorageService } from './storage';

const SUPABASE_URL = 'https://qeoxkfrcenbotguzgzln.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lBjMK9HcJ7vZiWeLFNTbIg_ZagnxSen';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseService {
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('settings').select('*').limit(1);
      if (error) {
        console.warn('Supabase table might not exist yet:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase connection failed:', e);
      return false;
    }
  }

  // Sync / Load data from Supabase with LocalStorage fallback & deleted paper filtering
  static async loadAllData(): Promise<{
    settings: AppSettings;
    classes: ClassRecord[];
    papers: ExaminationPaper[];
    history: StatusHistoryEntry[];
  }> {
    try {
      const isConnected = await this.testConnection();
      if (!isConnected) {
        return {
          settings: StorageService.getSettings(),
          classes: StorageService.getClasses(),
          papers: StorageService.getPapers(),
          history: StorageService.getHistory(),
        };
      }

      // Fetch from Supabase tables
      const [settingsRes, classesRes, papersRes, historyRes] = await Promise.all([
        supabase.from('settings').select('*').limit(1),
        supabase.from('classes').select('*'),
        supabase.from('papers').select('*'),
        supabase.from('history').select('*'),
      ]);

      const settings =
        settingsRes.data && settingsRes.data.length > 0
          ? settingsRes.data[0].payload
          : StorageService.getSettings();

      const classes =
        classesRes.data && classesRes.data.length > 0
          ? classesRes.data.map((row: any) => row.payload)
          : StorageService.getClasses();

      const rawPapers =
        papersRes.data && papersRes.data.length > 0
          ? papersRes.data.map((row: any) => row.payload)
          : StorageService.getPapers();

      const deletedIds = StorageService.getDeletedPaperIds();

      // Filter out any locally deleted papers and purge them from Supabase if still present
      const papers = rawPapers.filter((p: ExaminationPaper) => {
        if (deletedIds.has(p.id)) {
          supabase.from('papers').delete().eq('id', p.id).then();
          return false;
        }
        return true;
      });

      const history =
        historyRes.data && historyRes.data.length > 0
          ? historyRes.data.map((row: any) => row.payload)
          : StorageService.getHistory();

      return { settings, classes, papers, history };
    } catch (e) {
      console.error('Error loading from Supabase, falling back to LocalStorage:', e);
      return {
        settings: StorageService.getSettings(),
        classes: StorageService.getClasses(),
        papers: StorageService.getPapers(),
        history: StorageService.getHistory(),
      };
    }
  }

  // Save / Upsert records to Supabase
  static async saveSettings(settings: AppSettings): Promise<void> {
    StorageService.saveSettings(settings);
    try {
      await supabase.from('settings').upsert({ id: 'primary', payload: settings });
    } catch (e) {
      console.error('Supabase saveSettings error:', e);
    }
  }

  static async saveClasses(classes: ClassRecord[]): Promise<void> {
    StorageService.saveClasses(classes);
    try {
      const rows = classes.map((c) => ({ id: c.id, payload: c }));
      await supabase.from('classes').upsert(rows);
    } catch (e) {
      console.error('Supabase saveClasses error:', e);
    }
  }

  static async savePapers(papers: ExaminationPaper[]): Promise<void> {
    StorageService.savePapers(papers);
    try {
      const rows = papers.map((p) => ({ id: p.id, payload: p }));
      await supabase.from('papers').upsert(rows);
    } catch (e) {
      console.error('Supabase savePapers error:', e);
    }
  }

  static async saveHistory(history: StatusHistoryEntry[]): Promise<void> {
    StorageService.saveHistory(history);
    try {
      const rows = history.map((h) => ({ id: h.id, payload: h }));
      await supabase.from('history').upsert(rows);
    } catch (e) {
      console.error('Supabase saveHistory error:', e);
    }
  }

  static async deletePaper(paperId: string): Promise<void> {
    StorageService.addDeletedPaperId(paperId);
    try {
      await supabase.from('papers').delete().eq('id', paperId);
    } catch (e) {
      console.error('Supabase deletePaper error:', e);
    }
  }

  static async deleteClass(classId: string): Promise<void> {
    try {
      await supabase.from('classes').delete().eq('id', classId);
    } catch (e) {
      console.error('Supabase deleteClass error:', e);
    }
  }
}
