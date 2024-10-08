export function EditButton({show, setOpenEditor}) {
    if (!show) {
        return null;
    }
    return (
        <>
            <button
                className="edit-button"
                onClick={() => {
                    setOpenEditor(true);
                }}
            >
                Edit
            </button>
        </>
    )
}