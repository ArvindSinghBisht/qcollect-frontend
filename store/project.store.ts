import { create } from "zustand";
import { Project } from "@/types/project";

interface ProjectState {

    projects: Project[];

    selectedProject: Project | null;

    loading: boolean;

    setProjects: (projects: Project[]) => void;

    setLoading: (loading: boolean) => void;

    setSelectedProject: (project: Project) => void;
}

export const useProjectStore =
create<ProjectState>((set)=>({

    projects: [],

    selectedProject: null,

    loading:false,

    setProjects:(projects)=>
        set({projects}),

    setLoading:(loading)=>
        set({loading}),

    setSelectedProject:(project)=>
        set({selectedProject:project})

}));