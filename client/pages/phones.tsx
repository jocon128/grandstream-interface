import React, { useState } from "react";
import { Table, Tag, Button, Input, Dropdown, Modal, Form } from "antd";
import { EllipsisOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { usePhonesQuery, useUpdatePhoneMutation } from "../generated";
import { useDebounce } from "react-use";
import PhoneActionsMenu from "../components/PhoneActionsMenu";
import RoomSelect from "../components/RoomSelect";

const { confirm } = Modal;

interface Props {}

const showDeleteConfirm = () => {
  confirm({
    title: "Are you sure delete this phone?",
    icon: <ExclamationCircleOutlined />,
    content: "Some descriptions",
    okText: "Yes",
    okType: "danger",
    cancelText: "No",
    onOk() {
      console.log("OK");
    },
    onCancel() {
      console.log("Cancel");
    },
  });
};

const phones = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roomSelectValue, setRoomSelectValue] = useState("");
  const [editRoomNumberMacAddress, setEditRoomNumberMacAddress] = useState("");
  const [isEditRoomModalVisisble, setIsEditRoomModalVisisble] = useState(false);
  const { data: updatedPhoneData, mutate } = useUpdatePhoneMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const [editRoomNumberForm] = Form.useForm();

  const columns = [
    {
      title: "Mac Address",
      dataIndex: "mac_address",
      key: "mac_address",
    },
    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let c;
        switch (text) {
          case "ONLINE":
            c = "green";
            break;
          case "DISCONNECTED":
            c = "red";
            break;
          case "DISCOVERED":
            c = "blue";
            break;
          default:
            c = "orange";
        }
        return <Tag color={c}>{text}</Tag>;
      },
    },
    {
      title: "Room Number",
      dataIndex: ["room", "number"],
      key: "room_number",
    },
    {
      title: "Last Check",
      dataIndex: "lastCheckedAt",
      key: "lastCheckedAt",
      render: (text) => text && dayjs(text).fromNow(),
    },
    {
      key: "action",
      render: (_, record) => (
        <>
          <Dropdown
            overlay={PhoneActionsMenu({
              showDeleteConfirm,
              showEditRoomModal,
              record,
            })}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button icon={<EllipsisOutlined />}></Button>
          </Dropdown>
        </>
      ),
    },
  ];

  const showEditRoomModal = (
    id: number,
    macAddress: string,
    room_number?: number | null
  ) => {
    setIsEditRoomModalVisisble(true);
    editRoomNumberForm.setFieldsValue({
      id: id,
      mac_address: macAddress,
      room_number: room_number,
    });
  };

  const handleSaveEditRoomModal = () => {
    setIsEditRoomModalVisisble(false);
    editRoomNumberForm.submit();
  };

  const handlleRoomSelectChange = (newValue) => {
    setRoomSelectValue(newValue);
    editRoomNumberForm.setFieldsValue({ room_number: newValue });
  };

  const handleCancelEditRoomModal = () => {
    setIsEditRoomModalVisisble(false);
    setRoomSelectValue("");
    editRoomNumberForm.setFieldsValue({ room_number: undefined });
  };

  const onFinish = (values: any) => {
    mutate({ data: { id: values.id, room_id: values.room_number } });
    setRoomSelectValue("");
    editRoomNumberForm.setFieldsValue({ room_number: undefined });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const { data, isLoading, isSuccess, error, refetch } = usePhonesQuery(
    { searchString: searchQuery },
    {
      // Refetch the data every 30 secs
      refetchInterval: 30 * 1000,
    }
  );

  useDebounce(
    () => {
      setSearchQuery(searchText);
    },
    300,
    [searchText]
  );

  return (
    <>
      <Modal
        title="Edit Room Number Assignment"
        visible={isEditRoomModalVisisble}
        onOk={handleSaveEditRoomModal}
        okText="Save"
        onCancel={handleCancelEditRoomModal}
      >
        <Form
          form={editRoomNumberForm}
          name="editRoomNumber"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item name="id" style={{ display: "none" }}>
            <></>
          </Form.Item>
          <Form.Item label="Mac Address" name="mac_address">
            <Input disabled value={editRoomNumberMacAddress} />
          </Form.Item>
          <Form.Item label="Room Number" name="room_number">
            <RoomSelect
              value={roomSelectValue}
              handleChange={handlleRoomSelectChange}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Input
        placeholder="Search"
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
      />
      <Table
        dataSource={data && data.phones}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={isLoading && !isSuccess && !error}
      />
    </>
  );
};

export default phones;
