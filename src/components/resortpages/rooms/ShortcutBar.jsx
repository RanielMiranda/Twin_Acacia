import { HashLink } from "react-router-hash-link";

export default function ShortcutBar() {
  return (
    <div className="bg-white border-b mt-6">
      <div className="max-w-6xl mx-auto px-4 py-3 flex gap-6 text-sm font-medium text-gray-600">
        <button className="hover:text-blue-600">Overview</button>

        <HashLink smooth to="#rooms" className="hover:text-blue-600">
          Available Rooms
        </HashLink>

        <HashLink smooth to="#amenities" className="hover:text-blue-600">
          Amenities
        </HashLink>

        <HashLink smooth to ='#extra-services' className="hover:text-blue-600">
          Additional Services
        </HashLink>
      </div>
    </div>
  );
}
