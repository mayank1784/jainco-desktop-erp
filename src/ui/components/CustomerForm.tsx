import React from 'react';

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: Omit<Customer, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customer = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      stateName: formData.get('stateName') as string,
      districtName: formData.get('districtName') as string,
      country: formData.get('country') as string || 'india',
      pincode: formData.get('pincode') as string,
    };
    onSubmit(customer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          defaultValue={initialData.name}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          defaultValue={initialData.email}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          defaultValue={initialData.phone}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          name="address"
          id="address"
          rows={3}
          defaultValue={initialData.address}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="stateName" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            name="stateName"
            id="stateName"
            defaultValue={initialData.stateName}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="districtName" className="block text-sm font-medium text-gray-700">
            District
          </label>
          <input
            type="text"
            name="districtName"
            id="districtName"
            defaultValue={initialData.districtName}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            name="country"
            id="country"
            defaultValue={initialData.country || 'india'}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
            Pincode
          </label>
          <input
            type="text"
            name="pincode"
            id="pincode"
            defaultValue={initialData.pincode}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
// import React from 'react';
// import { useForm, SubmitHandler } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Customer } from '../types';

// interface CustomerFormProps {
//   initialData?: Partial<Customer>;
//   onSubmit: (data: Omit<Customer, 'id' | 'created_at'>) => void;
//   onCancel: () => void;
// }

// // Zod schema for validation
// const customerSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
//   email: z.string().email('Invalid email address').optional(),
//   phone: z
//     .string()
//     .regex(/^\d{10}$/, 'Phone must be a 10-digit number')
//     .optional(),
//   address: z.string().optional(),
//   stateName: z.string().optional(),
//   districtName: z.string().optional(),
//   country: z.string().default('india'),
//   pincode: z
//     .string()
//     .regex(/^\d{6}$/, 'Pincode must be a 6-digit number')
//     .optional(),
// });

// type CustomerFormValues = z.infer<typeof customerSchema>;

// const CustomerForm: React.FC<CustomerFormProps> = ({
//   initialData = {},
//   onSubmit,
//   onCancel,
// }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<CustomerFormValues>({
//     defaultValues: {
//       ...initialData,
//       country: initialData.country || 'india',
//     },
//     resolver: zodResolver(customerSchema),
//   });

//   const onSubmitHandler: SubmitHandler<CustomerFormValues> = (data) => {
//     onSubmit(data);
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
//       <div>
//         <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//           Name *
//         </label>
//         <input
//           {...register('name')}
//           id="name"
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//         />
//         {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
//       </div>

//       <div>
//         <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//           Email
//         </label>
//         <input
//           {...register('email')}
//           id="email"
//           type="email"
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//         />
//         {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
//       </div>

//       <div>
//         <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//           Phone
//         </label>
//         <input
//           {...register('phone')}
//           id="phone"
//           type="tel"
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//         />
//         {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
//       </div>

//       <div>
//         <label htmlFor="address" className="block text-sm font-medium text-gray-700">
//           Address
//         </label>
//         <textarea
//           {...register('address')}
//           id="address"
//           rows={3}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//         />
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label htmlFor="stateName" className="block text-sm font-medium text-gray-700">
//             State
//           </label>
//           <input
//             {...register('stateName')}
//             id="stateName"
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="districtName" className="block text-sm font-medium text-gray-700">
//             District
//           </label>
//           <input
//             {...register('districtName')}
//             id="districtName"
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label htmlFor="country" className="block text-sm font-medium text-gray-700">
//             Country
//           </label>
//           <input
//             {...register('country')}
//             id="country"
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
//             Pincode
//           </label>
//           <input
//             {...register('pincode')}
//             id="pincode"
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//           />
//           {errors.pincode && (
//             <p className="text-red-500 text-sm">{errors.pincode.message}</p>
//           )}
//         </div>
//       </div>

//       <div className="flex justify-end space-x-3">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
//         >
//           Save
//         </button>
//       </div>
//     </form>
//   );
// };

// export default CustomerForm;
