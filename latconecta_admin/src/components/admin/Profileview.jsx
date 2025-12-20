import React, { useState, useEffect, memo } from "react";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelper";
import usersService from "../../services/usersService";
import authService from "../../services/authService";

const ProfileView = ({
  // Props de formulario
  formData,
  setFormData,

  // Estados necesarios
  user,
  showPassword,
  setShowPassword,
  updateMessage,
  setUpdateMessage,

  // Funciones necesarias
  handleImageUpload,
  showNotification,
}) => {
  // Estado local para el teléfono completo (con código de país)
  const [phoneValue, setPhoneValue] = useState("");

  // Inicializar formData con datos del usuario (solo una vez)
  useEffect(() => {
    if (user && !formData.user_name) {
      // Combinar código de país y número para mostrar
      const countryCode = user?.user_phone_country_code || "";
      const phoneNumber = user?.user_phone_number || "";
      const fullPhone = countryCode && phoneNumber ? `${countryCode}${phoneNumber}` : "";

      setPhoneValue(fullPhone);

      setFormData({
        user_name: user?.name || "",
        user_email: user?.email || "",
        user_phone_country_code: countryCode,
        user_phone_number: phoneNumber,
        user_photo: user?.user_photo || "",
        user_current_password: "",
        user_new_password: "",
        user_confirm_password: "",
      });
    }
  }, [user, formData.user_name, setFormData]);

  // 🔍 DEBUG: Ver estructura del user
  useEffect(() => {
    console.log("👤 USER COMPLETO:", user);
    console.log("📸 user_photo:", user?.user_photo);
    console.log("📋 formData completo:", formData);
  }, [user, formData]);

  const [localPasswordData, setLocalPasswordData] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  // Manejar cambio de teléfono
  const handlePhoneChange = (value, country) => {
    setPhoneValue(value);

    // Extraer código de país y número
    const countryCode = `+${country.dialCode}`;
    const phoneNumber = value.substring(country.dialCode.length);

    setFormData({
      ...formData,
      user_phone_country_code: countryCode,
      user_phone_number: phoneNumber
    });
  };

  const handleUpdateProfile = async () => {
    try {
      // Validaciones básicas
      if (!formData.user_name) {
        const message = "✗ El nombre es obligatorio";
        setUpdateMessage(message);
        if (showNotification) showNotification(message, "error");
        setTimeout(() => setUpdateMessage(""), 3000);
        return;
      }

      if (!formData.user_email) {
        const message = "✗ El email es obligatorio";
        setUpdateMessage(message);
        if (showNotification) showNotification(message, "error");
        setTimeout(() => setUpdateMessage(""), 3000);
        return;
      }

      // Preparar datos para actualizar
      const updateData = {
        user_name: formData.user_name,
        user_email: formData.user_email,
        user_phone_country_code: formData.user_phone_country_code || "+51",
        user_phone_number: formData.user_phone_number || "",
        user_photo: formData.user_photo || null,
      };

      // Solo incluir user_photo si tiene valor
      if (!updateData.user_photo) {
        delete updateData.user_photo;
      }

      // Actualizar en el backend
      await usersService.update(user.id, updateData);

      const message = "✓ Perfil actualizado exitosamente";
      setUpdateMessage(message);
      if (showNotification) showNotification("Perfil actualizado", "success");

      // Actualizar usuario en localStorage
      const currentUser = authService.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        name: formData.user_name,
        email: formData.user_email,
        user_photo: formData.user_photo,
        user_phone_country_code: formData.user_phone_country_code,
        user_phone_number: formData.user_phone_number
      };
      localStorage.setItem('latconecta_user', JSON.stringify(updatedUser));

      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      const message = "✗ Error al actualizar el perfil";
      setUpdateMessage(message);
      if (showNotification) showNotification(message, "error");
      setTimeout(() => setUpdateMessage(""), 3000);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      // Validaciones
      if (!localPasswordData.current) {
        const message = "✗ Debe ingresar la contraseña actual";
        setUpdateMessage(message);
        if (showNotification) showNotification(message, "error");
        setTimeout(() => setUpdateMessage(""), 3000);
        return;
      }

      if (!localPasswordData.newPassword) {
        const message = "✗ Debe ingresar una nueva contraseña";
        setUpdateMessage(message);
        if (showNotification) showNotification(message, "error");
        setTimeout(() => setUpdateMessage(""), 3000);
        return;
      }

      if (localPasswordData.newPassword !== localPasswordData.confirm) {
        const message = "✗ Las contraseñas no coinciden";
        setUpdateMessage(message);
        if (showNotification) showNotification(message, "error");
        setTimeout(() => setUpdateMessage(""), 3000);
        return;
      }

      if (localPasswordData.newPassword.length < 6) {
        const message = "✗ La contraseña debe tener al menos 6 caracteres";
        setUpdateMessage(message);
        if (showNotification) showNotification(message, "error");
        setTimeout(() => setUpdateMessage(""), 3000);
        return;
      }

      // Llamar al endpoint de cambio de contraseña con los 3 campos
      await authService.changePassword(
        localPasswordData.current,
        localPasswordData.newPassword,
        localPasswordData.confirm
      );

      const message = "✓ Contraseña actualizada exitosamente";
      setUpdateMessage(message);
      if (showNotification)
        showNotification("Contraseña actualizada", "success");
      setLocalPasswordData({ current: "", newPassword: "", confirm: "" });
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);

      // Manejar errores específicos del backend
      let message = "✗ Error al actualizar la contraseña";
      if (error.response?.data?.detail) {
        message = `✗ ${error.response.data.detail}`;
      } else if (error.detail) {
        message = `✗ ${error.detail}`;
      } else if (error.message) {
        message = `✗ ${error.message}`;
      }

      setUpdateMessage(message);
      if (showNotification) showNotification(message, "error");
      setTimeout(() => setUpdateMessage(""), 3000);
    }
  };

  const handlePhotoUpload = (e) => {
    handleImageUpload(
      e,
      (photoUrl) => {
        setFormData({ ...formData, user_photo: photoUrl });
      },
      "users"
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#FFE709]">
        <h2 className="text-xl font-bold text-[#008C96] mb-4">
          Información del Usuario
        </h2>

        <div className="flex items-start space-x-6">
          <div className="flex flex-col items-center space-y-2">
            <img
              src={getImageUrl(formData.user_photo, "user")}
              alt={formData.user_name}
              onError={(e) => (e.target.src = FALLBACK_IMAGES.user)}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#FFE709]"
            />
            <label className="cursor-pointer bg-[#008C96] text-white px-3 py-1 rounded text-sm hover:bg-[#006B74]">
              Cambiar Foto
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.user_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, user_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.user_email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, user_email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <PhoneInput
                country={'pe'}
                value={phoneValue}
                onChange={handlePhoneChange}
                inputClass="w-full"
                containerClass="phone-input-container"
                buttonClass="phone-input-button"
                inputStyle={{
                  width: '100%',
                  height: '42px',
                  fontSize: '14px',
                  paddingLeft: '48px',
                  borderRadius: '0.5rem',
                  border: '1px solid #D1D5DB'
                }}
                buttonStyle={{
                  borderRadius: '0.5rem 0 0 0.5rem',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#F9FAFB'
                }}
                dropdownStyle={{
                  maxHeight: '200px'
                }}
                enableSearch={true}
                searchPlaceholder="Buscar país..."
                searchNotFound="No se encontró el país"
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              className="bg-[#008C96] text-white px-6 py-2 rounded-lg hover:bg-[#006B74]"
            >
              Actualizar Perfil
            </button>
          </div>
        </div>

        {updateMessage && (
          <div
            className={`mt-4 px-4 py-2 rounded ${
              updateMessage.includes("✓")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {updateMessage}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#FFE709]">
        <h2 className="text-xl font-bold text-[#008C96] mb-4">
          Actualizar Contraseña
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                value={localPasswordData.current}
                onChange={(e) =>
                  setLocalPasswordData({
                    ...localPasswordData,
                    current: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                maxLength={25}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword({
                    ...showPassword,
                    current: !showPassword.current,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008C96]"
              >
                {showPassword.current ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                value={localPasswordData.newPassword}
                onChange={(e) =>
                  setLocalPasswordData({
                    ...localPasswordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                maxLength={25}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword({ ...showPassword, new: !showPassword.new })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008C96]"
              >
                {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={localPasswordData.confirm}
                onChange={(e) =>
                  setLocalPasswordData({
                    ...localPasswordData,
                    confirm: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                maxLength={25}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword({
                    ...showPassword,
                    confirm: !showPassword.confirm,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008C96]"
              >
                {showPassword.confirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleUpdatePassword}
            className="bg-[#008C96] text-white px-6 py-2 rounded-lg hover:bg-[#006B74]"
          >
            Actualizar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ProfileView);