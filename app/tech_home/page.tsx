'use client';

import { useState } from 'react';
import { Monitor, Wrench, Bolt, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const materiels = [
  { id: 1, label: 'Informatique', icon: Monitor },
  { id: 2, label: 'Électricité', icon: Bolt },
  { id: 3, label: 'Mécanique', icon: Wrench },
  { id: 4, label: 'Automatisme', icon: Cpu },
];

const missions = [
  { id: 1, name: 'Installation d\'équipements', status: 'En attente' },
  { id: 2, name: 'Réparation électrique', status: 'Approuvée' },
  { id: 3, name: 'Vérification des systèmes', status: 'En attente' },
];

export default function TechnicienPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // Temps restant en minutes
  const [missionStatus, setMissionStatus] = useState<string | null>(null);

  // Fonction pour simuler le décompte du temps restant
  setTimeout(() => {
    if (timeLeft > 0) setTimeLeft(timeLeft - 1);
  }, 60000); // Décrémenter le temps chaque minute

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 px-8 py-12">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-indigo-700 mb-12">
          Espace Technicien Sagemcom
        </h1>

        {/* Section Sélection de Matériel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {materiels.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              onClick={() => setSelected(id)}
              className={`group border-2 rounded-lg p-8 text-center cursor-pointer transition-transform duration-300 
                ${selected === id 
                  ? 'bg-indigo-700 text-white border-indigo-700' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-600 hover:shadow-lg'}
              `}
            >
              <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-14 h-14 text-indigo-700" />
              </div>
              <h2 className="text-xl font-semibold">{label}</h2>
            </div>
          ))}
        </div>

        {/* Section Time Left */}
        <div className="mt-12 bg-white p-8 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Temps restant avant la mission</h2>
          <div className="text-xl font-bold text-indigo-600">
            {timeLeft} minutes restantes
          </div>
        </div>

        {/* Missions à approuver */}
        <div className="mt-12 bg-white p-8 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Missions à approuver</h2>
          <ul className="space-y-4">
            {missions.map((mission) => (
              <li key={mission.id} className="flex justify-between items-center">
                <div className="text-lg font-medium">{mission.name}</div>
                <div
                  className={`text-sm font-semibold py-1 px-3 rounded-md ${
                    mission.status === 'En attente'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-green-200 text-green-800'
                  }`}
                >
                  {mission.status}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Information supplémentaire avec indicateurs */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-lg font-medium text-gray-700">Indications importantes</div>
            <p className="text-sm mt-4 text-gray-500">
              Assurez-vous de vérifier les équipements avant de commencer chaque tâche.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-lg font-medium text-gray-700">Progrès des missions</div>
            <div className="w-full bg-gray-300 h-2 rounded-full mt-4">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <div className="text-sm mt-2 text-gray-500">50% du travail terminé</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-lg font-medium text-gray-700">Validation des tâches</div>
            <p className="text-sm mt-4 text-gray-500">
              Toutes les tâches doivent être validées avant la fin de la journée.
            </p>
          </div>
        </div>

        {/* Formulaire et Action */}
        {selected && (
          <div className="max-w-3xl mx-auto mt-12 bg-white text-gray-900 rounded-xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">
              Matériel sélectionné :{' '}
              <span className="text-indigo-700">
                {materiels.find((m) => m.id === selected)?.label}
              </span>
            </h2>
            <p className="mb-6">
              Vous avez sélectionné le matériel. Vous pouvez maintenant accéder aux outils spécifiques ou consulter les modèles.
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg">
              Accéder aux outils
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
