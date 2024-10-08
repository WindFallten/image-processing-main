import {SizeSettings} from "./SizeSettings/SizeSettings";

export function EditModal({openEditor, setOpenEdit, setWidth, setHeight}) {

    return (
        <>
            <dialog className="edit-dialog"
                    open={openEditor}
            >
                <button onClick={() => setOpenEdit(false)}>X</button>
                <SizeSettings/>
            </dialog>
        </>
    )
}