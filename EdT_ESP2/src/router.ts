// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/bdd`
  | `/bilan`
  | `/calendrier`
  | `/etudiant/calendrier`
  | `/etudiant/emploi-du-temps`
  | `/etudiant/matieres`
  | `/login`
  | `/plan`
  | `/professeur/emploi-du-temps`
  | `/professeur/seances`
  | `/professeur/seances/:id`
  | `/professeur/volume-horaire`
  | `/register`
  | `/setup`
  | `/setup/complete`
  | `/test-api`

export type Params = {
  '/professeur/seances/:id': { id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
