import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { validator } from "../../../utils/validator";
import TextField from "../../common/form/textField";
import SelectField from "../../common/form/selectField";
import RadioField from "../../common/form/radioField";
import MultiSelectField from "../../common/form/multiSelectField";
import BackHistoryButton from "../../common/backButton";
import { useQualities } from "../../../hooks/useQualities";
import { useProfessions } from "../../../hooks/useProfession";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";

const EditUserPage = () => {
    const { userId } = useParams();
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [data, setData] = useState({
        name: "",
        email: "",
        profession: "",
        sex: "male",
        qualities: []
    });

    const { currentUser, editUser } = useAuth();
    const { isLoading: isLoadingQalities, qualities } = useQualities();
    let qualitiesList = {};
    if (!isLoadingQalities) {
        qualitiesList = qualities.map((q) => ({
            label: q.name,
            value: q._id
        }));
    }

    const { isLoading: isLoadingProfessions, professions } = useProfessions();
    const professionsList = professions.map((p) => ({
        label: p.name,
        value: p._id
    }));
    const getProfessionById = (id) => {
        for (const prof of professions) {
            if (prof._id === id) {
                return prof._id;
            }
        }
    };
    const getQualities = (elements) => {
        const qualitiesArray = [];
        for (const elem of elements) {
            for (const quality in qualities) {
                if (elem.value === qualities[quality]._id) {
                    qualitiesArray.push(qualities[quality]._id);
                }
            }
        }
        return qualitiesArray;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validate();
        if (!isValid) return;
        const { profession, qualities } = data;

        try {
            await editUser(data._id, {
                ...data,
                profession: getProfessionById(profession),
                qualities: getQualities(qualities)
            });
            history.push(`/users/${userId}`);
        } catch (error) {
            setErrors(error);
            toast.error(errors);
        }
    };
    const transformData = (data) => {
        if (data) {
            const qualitiesData = [];
            data.forEach((item) => {
                const qualiti = qualities.find((q) => q._id === item);
                const qualitiesDataOb = {};
                qualitiesDataOb.label = qualiti.name;
                qualitiesDataOb.value = item;
                qualitiesData.push(qualitiesDataOb);
            });
            return qualitiesData;
        }
    };
    useEffect(() => {
        setIsLoading(true);
        if (!isLoadingQalities && !isLoadingProfessions) {
            setData((prevState) => ({
                ...prevState,
                ...currentUser,
                _id: currentUser._id,
                qualities: transformData(currentUser.qualities),
                profession: currentUser.profession
            }));
        }
    }, [qualities, professions]);
    useEffect(() => {
        if ("_id" in data) {
            setIsLoading(false);
        }
    }, [data]);

    useEffect(() => {
        if (userId !== currentUser._id) {
            history.push(`/users/${currentUser._id}`);
        }
    }, []);
    const validatorConfig = {
        email: {
            isRequired: {
                message: "Электронная почта обязательна для заполнения"
            },
            isEmail: {
                message: "Email введен некорректно"
            }
        },
        name: {
            isRequired: {
                message: "Введите ваше имя"
            }
        }
    };
    useEffect(() => {
        validate();
    }, [data]);
    const handleChange = (target) => {
        setData((prevState) => ({
            ...prevState,
            [target.name]: target.value
        }));
    };
    const validate = () => {
        const errors = validator(data, validatorConfig);
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const isValid = Object.keys(errors).length === 0;
    return (
        <div className="container mt-5">
            <BackHistoryButton />
            <div className="row">
                <div className="col-md-6 offset-md-3 shadow p-4">
                    {!isLoading &&
                    Object.keys(professions).length > 0 &&
                    Object.keys(qualities).length > 0 ? (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Имя"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                                error={errors.name}
                            />
                            <TextField
                                label="Электронная почта"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                            <SelectField
                                label="Выбери свою профессию"
                                defaultOption="Choose..."
                                options={professionsList}
                                name="profession"
                                onChange={handleChange}
                                value={data.profession}
                                error={errors.profession}
                            />
                            <RadioField
                                options={[
                                    { name: "Male", value: "male" },
                                    { name: "Female", value: "female" },
                                    { name: "Other", value: "other" }
                                ]}
                                value={data.sex}
                                name="sex"
                                onChange={handleChange}
                                label="Выберите ваш пол"
                            />

                            <MultiSelectField
                                defaultValue={data.qualities}
                                options={qualitiesList}
                                onChange={handleChange}
                                name="qualities"
                                label="Выберите ваши качества"
                            />

                            <button
                                type="submit"
                                disabled={!isValid}
                                className="btn btn-primary w-100 mx-auto"
                            >
                                Обновить
                            </button>
                        </form>
                    ) : (
                        "Loading..."
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditUserPage;
